import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — server only, bypasses RLS. Never import from a
 * "use client" file or a route that returns its output straight to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
