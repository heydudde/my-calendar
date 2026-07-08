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
