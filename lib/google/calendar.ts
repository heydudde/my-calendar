import { google } from "googleapis";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

function getAuth() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return oauth2Client;
}

function getCalendarClient() {
  return google.calendar({ version: "v3", auth: getAuth() });
}

/** Named tool: gcal_check_freebusy — true = slot is free */
export async function gcalCheckFreebusy(
  startISO: string,
  endISO: string,
): Promise<boolean> {
  const calendar = getCalendarClient();
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: startISO,
      timeMax: endISO,
      items: [{ id: CALENDAR_ID }],
    },
  });
  const busy = res.data.calendars?.[CALENDAR_ID]?.busy ?? [];
  return busy.length === 0;
}

/** Named tool: gcal_create_event */
export async function gcalCreateEvent(params: {
  clientName: string;
  clientEmail: string;
  topic: string;
  startISO: string;
  endISO: string;
}): Promise<{ eventId: string; htmlLink: string }> {
  const calendar = getCalendarClient();
  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: `${params.topic} — ${params.clientName}`,
      description: `Booked via my-calendar by ${params.clientName} (${params.clientEmail})`,
      start: { dateTime: params.startISO },
      end: { dateTime: params.endISO },
      attendees: [{ email: params.clientEmail, displayName: params.clientName }],
    },
  });
  if (!res.data.id || !res.data.htmlLink) {
    throw new Error("Google Calendar did not return an event id/link");
  }
  return { eventId: res.data.id, htmlLink: res.data.htmlLink };
}

/** Named tool: gcal_delete_event */
export async function gcalDeleteEvent(eventId: string): Promise<void> {
  const calendar = getCalendarClient();
  await calendar.events.delete({ calendarId: CALENDAR_ID, eventId });
}

export type WorkingHours = Record<string, { start: string; end: string }[]>;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function roundUpTo15(d: Date): Date {
  const ms = 15 * 60_000;
  return new Date(Math.ceil(d.getTime() / ms) * ms);
}

/**
 * Scans working-hours windows over the next N days against Google Calendar
 * free/busy (built on the same gcal_check_freebusy primitive) and returns
 * the earliest open slots, honoring a buffer around existing events.
 */
export async function gcalSuggestNextSlots(params: {
  durationMinutes: number;
  workingHours: WorkingHours;
  bufferMinutes: number;
  from?: Date;
  daysToScan?: number;
  limit?: number;
}): Promise<string[]> {
  const from = params.from ?? new Date();
  const daysToScan = params.daysToScan ?? 7;
  const limit = params.limit ?? 3;
  const rangeStart = from;
  const rangeEnd = new Date(from.getTime() + daysToScan * 24 * 60 * 60 * 1000);

  const calendar = getCalendarClient();
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEnd.toISOString(),
      items: [{ id: CALENDAR_ID }],
    },
  });
  const busy = (res.data.calendars?.[CALENDAR_ID]?.busy ?? []).map((b) => ({
    start: new Date(b.start!).getTime(),
    end: new Date(b.end!).getTime(),
  }));

  const results: string[] = [];
  for (let dayOffset = 0; dayOffset < daysToScan && results.length < limit; dayOffset++) {
    const day = new Date(rangeStart);
    day.setDate(day.getDate() + dayOffset);
    const windows = params.workingHours[DAY_KEYS[day.getDay()]] ?? [];

    for (const w of windows) {
      if (results.length >= limit) break;
      const [startH, startM] = w.start.split(":").map(Number);
      const [endH, endM] = w.end.split(":").map(Number);
      const windowStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), startH, startM, 0, 0);
      const windowEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), endH, endM, 0, 0);

      let cursor = roundUpTo15(new Date(Math.max(windowStart.getTime(), rangeStart.getTime())));

      while (
        cursor.getTime() + params.durationMinutes * 60_000 <= windowEnd.getTime() &&
        results.length < limit
      ) {
        const slotStart = cursor.getTime();
        const slotEnd = slotStart + params.durationMinutes * 60_000;
        const bufferedStart = slotStart - params.bufferMinutes * 60_000;
        const bufferedEnd = slotEnd + params.bufferMinutes * 60_000;

        const overlaps = busy.some((b) => bufferedStart < b.end && bufferedEnd > b.start);
        if (!overlaps) {
          results.push(new Date(slotStart).toISOString());
          cursor = new Date(slotEnd + 15 * 60_000);
        } else {
          cursor = new Date(cursor.getTime() + 15 * 60_000);
        }
      }
    }
  }

  return results.slice(0, limit);
}
