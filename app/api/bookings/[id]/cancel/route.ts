import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gcalDeleteEvent } from "@/lib/google/calendar";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, google_event_id")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json(
      { error: "not_found", message: "Booking not found." },
      { status: 404 },
    );
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ booking }, { status: 200 });
  }

  try {
    if (booking.google_event_id) {
      try {
        await gcalDeleteEvent(booking.google_event_id);
      } catch (err) {
        // The calendar event may already be gone; still cancel the booking record.
        console.error("gcal_delete_event_error", err);
      }
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ booking: updated }, { status: 200 });
  } catch (err) {
    console.error("cancel_booking_error", err);
    return NextResponse.json(
      { error: "server_error", message: "Could not cancel booking, please try again." },
      { status: 500 },
    );
  }
}
