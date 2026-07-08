import { createAdminClient } from "@/lib/supabase/admin";
import type { WorkingHours } from "@/lib/google/calendar";

export const BUILDER_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export type BuilderSettings = {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  working_hours: WorkingHours;
  buffer_minutes: number;
  updated_at: string;
};

const DEFAULT_WORKING_HOURS: WorkingHours = {
  mon: [{ start: "09:00", end: "17:00" }],
  tue: [{ start: "09:00", end: "17:00" }],
  wed: [{ start: "09:00", end: "17:00" }],
  thu: [{ start: "09:00", end: "17:00" }],
  fri: [{ start: "09:00", end: "17:00" }],
  sat: [],
  sun: [],
};

export async function getBuilderSettings(): Promise<BuilderSettings> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("builder_settings")
    .select("*")
    .eq("id", BUILDER_SETTINGS_ID)
    .maybeSingle();

  if (!data) {
    return {
      id: BUILDER_SETTINGS_ID,
      display_name: "Book a session",
      bio: "Pick a free time below — confirmed instantly, no double bookings.",
      avatar_url: null,
      working_hours: DEFAULT_WORKING_HOURS,
      buffer_minutes: 0,
      updated_at: new Date().toISOString(),
    };
  }
  return data as BuilderSettings;
}

export async function updateBuilderSettings(patch: {
  display_name?: string;
  bio?: string;
  avatar_url?: string | null;
  working_hours?: WorkingHours;
  buffer_minutes?: number;
}): Promise<BuilderSettings> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("builder_settings")
    .upsert({ id: BUILDER_SETTINGS_ID, ...patch, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data as BuilderSettings;
}
