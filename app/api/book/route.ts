import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gcalCheckFreebusy, gcalCreateEvent, gcalSuggestNextSlots } from "@/lib/google/calendar";
import { validateBookingInput } from "@/lib/bookings/validate";
import { resendSendBookingConfirmation } from "@/lib/email/resend";
import { getBuilderSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Could not read request body." },
      { status: 400 },
    );
  }

  const result = validateBookingInput(body);
  if ("error" in result) {
    return NextResponse.json(
      { error: "validation_error", message: result.error },
      { status: 400 },
    );
  }
  const { client_name, client_email, topic, requested_at, duration_minutes } = result.value;

  const start = new Date(requested_at);
  const end = new Date(start.getTime() + duration_minutes * 60_000);

  try {
    const isFree = await gcalCheckFreebusy(start.toISOString(), end.toISOString());

    if (!isFree) {
      const supabase = createAdminClient();
      const { data: declinedBooking } = await supabase
        .from("bookings")
        .insert({
          client_name,
          client_email,
          topic,
          requested_at: start.toISOString(),
          duration_minutes,
          status: "declined",
          decline_reason: "slot unavailable",
        })
        .select()
        .single();

      let suggestions: { suggested_at: string; suggestion_confidence: number }[] = [];
      try {
        const settings = await getBuilderSettings();
        const slots = await gcalSuggestNextSlots({
          durationMinutes: duration_minutes,
          workingHours: settings.working_hours,
          bufferMinutes: settings.buffer_minutes,
          from: new Date(),
          daysToScan: 7,
          limit: 3,
        });
        const now = Date.now();
        suggestions = slots.map((iso) => {
          const hoursFromNow = Math.max((new Date(iso).getTime() - now) / 3_600_000, 0.01);
          return { suggested_at: iso, suggestion_confidence: Math.min(1 / hoursFromNow, 1) };
        });

        if (declinedBooking && suggestions.length > 0) {
          await supabase.from("slot_suggestions").insert(
            suggestions.map((s) => ({
              booking_id: declinedBooking.id,
              suggested_at: s.suggested_at,
              suggestion_source: "google_freebusy_scan",
              suggestion_confidence: s.suggestion_confidence,
              suggestion_review_status: "unreviewed",
            })),
          );
        }
      } catch (suggestErr) {
        // Suggestions are a nice-to-have; never fail the decline response over them.
        console.error("slot_suggestion_error", suggestErr);
      }

      return NextResponse.json(
        {
          error: "slot_taken",
          message: "That slot is already taken — please choose another time.",
          suggestions,
        },
        { status: 409 },
      );
    }

    const event = await gcalCreateEvent({
      clientName: client_name,
      clientEmail: client_email,
      topic,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    });

    const supabase = createAdminClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        client_name,
        client_email,
        topic,
        requested_at: start.toISOString(),
        duration_minutes,
        status: "confirmed",
        google_event_id: event.eventId,
        google_event_link: event.htmlLink,
      })
      .select()
      .single();

    if (error) throw error;

    try {
      await resendSendBookingConfirmation({
        to: client_email,
        clientName: client_name,
        topic,
        requestedAt: booking.requested_at,
        eventLink: booking.google_event_link,
      });
    } catch (emailErr) {
      // A failed confirmation email should never undo a confirmed booking.
      console.error("booking_confirmation_email_error", emailErr);
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (err) {
    console.error("booking_error", err);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong, please try again." },
      { status: 500 },
    );
  }
}
