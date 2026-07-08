import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBuilderSettings } from "@/lib/settings";
import BookingForm from "@/components/BookingForm";
import BookingsList, { type BookingListItem } from "@/components/BookingsList";

export const dynamic = "force-dynamic";

export default async function Home() {
  // RLS locks the anon key to zero rows (Sprint 3), so the public demo list
  // is read server-side with the service-role key — never sent to the browser.
  const supabase = createAdminClient();
  const [{ data: bookings, error }, settings] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, client_name, topic, requested_at, duration_minutes, status, google_event_link")
      .order("requested_at", { ascending: true }),
    getBuilderSettings(),
  ]);

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-2 text-center">
          {settings.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.avatar_url}
              alt={settings.display_name}
              className="mx-auto h-16 w-16 rounded-full object-cover"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            {settings.display_name}
          </h1>
          <p className="text-neutral-500">{settings.bio}</p>
        </header>

        <BookingForm />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">Upcoming bookings</h2>
          <BookingsList bookings={(bookings as BookingListItem[]) ?? []} loadError={error?.message} />
        </section>

        <footer className="text-center">
          <Link href="/dashboard" className="text-xs text-neutral-400 hover:text-neutral-600 underline">
            Builder dashboard →
          </Link>
        </footer>
      </div>
    </main>
  );
}
