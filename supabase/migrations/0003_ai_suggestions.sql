-- Sprint 4: AI slot suggestions + working-hours config + branding.

create table if not exists slot_suggestions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  suggested_at timestamptz not null,
  suggestion_source text not null default 'google_freebusy_scan',
  suggestion_confidence numeric not null default 1.0,
  suggestion_review_status text not null default 'unreviewed',
  created_at timestamptz not null default now()
);

alter table slot_suggestions enable row level security;

drop policy if exists "slot_suggestions_owner_select" on slot_suggestions;
create policy "slot_suggestions_owner_select" on slot_suggestions
  for select using (
    exists (
      select 1 from bookings b
      where b.id = slot_suggestions.booking_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "slot_suggestions_owner_write" on slot_suggestions;
create policy "slot_suggestions_owner_write" on slot_suggestions
  for all using (
    exists (
      select 1 from bookings b
      where b.id = slot_suggestions.booking_id and b.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from bookings b
      where b.id = slot_suggestions.booking_id and b.user_id = auth.uid()
    )
  );

-- Single-row builder settings: working hours, buffer time, and booking-page branding.
create table if not exists builder_settings (
  id uuid primary key default gen_random_uuid(),
  display_name text not null default 'Book a session',
  bio text not null default '',
  avatar_url text,
  working_hours jsonb not null default '{
    "mon": [{"start": "09:00", "end": "17:00"}],
    "tue": [{"start": "09:00", "end": "17:00"}],
    "wed": [{"start": "09:00", "end": "17:00"}],
    "thu": [{"start": "09:00", "end": "17:00"}],
    "fri": [{"start": "09:00", "end": "17:00"}],
    "sat": [],
    "sun": []
  }'::jsonb,
  buffer_minutes integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table builder_settings enable row level security;

drop policy if exists "builder_settings_public_read" on builder_settings;
create policy "builder_settings_public_read" on builder_settings
  for select using (true);

drop policy if exists "builder_settings_owner_write" on builder_settings;
create policy "builder_settings_owner_write" on builder_settings
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

insert into builder_settings (id, display_name, bio)
  values ('00000000-0000-0000-0000-000000000001', 'Book a session', 'Pick a free time below — confirmed instantly, no double bookings.')
  on conflict (id) do nothing;
