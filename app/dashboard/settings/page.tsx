import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBuilderSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard/settings");
  }

  const settings = await getBuilderSettings();

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Settings</h1>
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-800 underline">
            ← Back to dashboard
          </Link>
        </header>

        <SettingsForm initial={settings} />
      </div>
    </main>
  );
}
