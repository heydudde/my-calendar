import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/** Named tool: resend_send_email — best-effort, never blocks a booking. */
export async function resendSendBookingConfirmation(params: {
  to: string;
  clientName: string;
  topic: string;
  requestedAt: string;
  eventLink: string | null;
}): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping confirmation email");
    return { sent: false };
  }

  const resend = new Resend(apiKey);
  const when = new Date(params.requestedAt).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Booking confirmed: ${params.topic}`,
    html: `
      <p>Hi ${params.clientName},</p>
      <p>Your session "<strong>${params.topic}</strong>" is confirmed for <strong>${when}</strong>.</p>
      ${params.eventLink ? `<p><a href="${params.eventLink}">View on Google Calendar</a></p>` : ""}
      <p>See you then!</p>
    `,
  });

  return { sent: true };
}
