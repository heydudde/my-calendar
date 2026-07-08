import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gcalCheckFreebusy, gcalCreateEvent } from "@/lib/google/calendar";
import { validateBookingInput } from "@/lib/bookings/validate";

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
      return NextResponse.json(
        {
          error: "slot_taken",
          message: "That slot is already taken — please choose another time.",
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

    return NextResponse.json({ booking }, { status: 200 });
  } catch (err) {
    console.error("booking_error", err);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong, please try again." },
      { status: 500 },
    );
  }
}
