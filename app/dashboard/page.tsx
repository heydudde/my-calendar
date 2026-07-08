import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardTable from "@/components/DashboardTable";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .order("requested_at", { ascending: true });

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 underline">
            ← Back to booking page
          </Link>
        </header>

        <DashboardTable bookings={(bookings as Booking[]) ?? []} loadError={error?.message} />
      </div>
    </main>
  );
}
