import { createClient } from "@/lib/supabase/server";
import BookingForm from "@/components/BookingForm";
import BookingsList, { type Booking } from "@/components/BookingsList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, client_name, topic, requested_at, duration_minutes, status, google_event_link")
    .order("requested_at", { ascending: true });

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Book a session
          </h1>
          <p className="text-neutral-500">
            Pick a free time on the calendar below — it&apos;s confirmed instantly, no double bookings.
          </p>
        </header>

        <BookingForm />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">Upcoming bookings</h2>
          <BookingsList bookings={(bookings as Booking[]) ?? []} loadError={error?.message} />
        </section>
      </div>
    </main>
  );
}
