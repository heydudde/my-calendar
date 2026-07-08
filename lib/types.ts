export type BookingStatus = "confirmed" | "declined" | "cancelled";

export type Booking = {
  id: string;
  client_name: string;
  client_email: string;
  topic: string;
  requested_at: string;
  duration_minutes: number;
  status: BookingStatus;
  google_event_id: string | null;
  google_event_link: string | null;
  decline_reason: string | null;
  created_at: string;
};
