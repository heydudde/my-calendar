export type BookingInput = {
  client_name: string;
  client_email: string;
  topic: string;
  requested_at: string;
  duration_minutes: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBookingInput(body: unknown): { error: string } | { value: BookingInput } {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid request body." };
  }
  const b = body as Record<string, unknown>;
  const client_name = typeof b.client_name === "string" ? b.client_name.trim() : "";
  const client_email = typeof b.client_email === "string" ? b.client_email.trim() : "";
  const topic = typeof b.topic === "string" ? b.topic.trim() : "";
  const requested_at = typeof b.requested_at === "string" ? b.requested_at : "";
  const duration_minutes = Number(b.duration_minutes) || 30;

  if (!client_name || !client_email || !topic || !requested_at) {
    return { error: "All fields are required." };
  }
  if (!EMAIL_RE.test(client_email)) {
    return { error: "Enter a valid email address." };
  }
  const startTime = new Date(requested_at).getTime();
  if (Number.isNaN(startTime)) {
    return { error: "Enter a valid date and time." };
  }
  if (startTime <= Date.now()) {
    return { error: "Pick a date and time in the future." };
  }
  if (duration_minutes < 15 || duration_minutes > 240) {
    return { error: "Duration must be between 15 and 240 minutes." };
  }

  return { value: { client_name, client_email, topic, requested_at, duration_minutes } };
}
