import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DashboardTable from "@/components/DashboardTable";
import SignOutButton from "@/components/SignOutButton";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Defense in depth — middleware already redirects unauthenticated requests,
  // but a Server Component should not assume it only runs after middleware.
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const supabase = createAdminClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .order("requested_at", { ascending: true });

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 underline">
              ← Back to booking page
            </Link>
            <Link href="/dashboard/settings" className="text-sm text-neutral-500 hover:text-neutral-800 underline">
              Settings
            </Link>
            <SignOutButton />
          </div>
        </header>

        <DashboardTable bookings={(bookings as Booking[]) ?? []} loadError={error?.message} />
      </div>
    </main>
  );
}
