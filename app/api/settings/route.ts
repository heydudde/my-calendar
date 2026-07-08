import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBuilderSettings, updateBuilderSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getBuilderSettings();
  return NextResponse.json({ settings }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sign in as the builder to change settings." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Could not read request body." },
      { status: 400 },
    );
  }
  const b = body as Record<string, unknown>;

  try {
    const settings = await updateBuilderSettings({
      display_name: typeof b.display_name === "string" ? b.display_name : undefined,
      bio: typeof b.bio === "string" ? b.bio : undefined,
      avatar_url: typeof b.avatar_url === "string" ? b.avatar_url : undefined,
      working_hours: typeof b.working_hours === "object" && b.working_hours !== null
        ? (b.working_hours as never)
        : undefined,
      buffer_minutes: typeof b.buffer_minutes === "number" ? b.buffer_minutes : undefined,
    });
    return NextResponse.json({ settings }, { status: 200 });
  } catch (err) {
    console.error("update_settings_error", err);
    return NextResponse.json(
      { error: "server_error", message: "Could not save settings, please try again." },
      { status: 500 },
    );
  }
}
