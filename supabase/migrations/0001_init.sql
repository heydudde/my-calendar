create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  client_name text not null,
  client_email text not null,
  topic text not null,
  requested_at timestamptz not null,
  duration_minutes integer not null default 30,
  status text not null default 'confirmed',
  google_event_id text,
  google_event_link text,
  decline_reason text,
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

drop policy if exists "bookings_v1_read" on bookings;
create policy "bookings_v1_read" on bookings for select using (true);

drop policy if exists "bookings_v1_write" on bookings;
create policy "bookings_v1_write" on bookings for all using (true) with check (true);

insert into bookings (id, client_name, client_email, topic, requested_at, duration_minutes, status, google_event_id, created_at) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Alice Tan', 'alice@example.com', 'Portfolio Review', now() + interval '1 day 10 hours', 30, 'confirmed', 'demo_event_001', now()),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Ben Cruz', 'ben@example.com', 'React Architecture Discussion', now() + interval '2 days 14 hours', 60, 'confirmed', 'demo_event_002', now()),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Clara Wu', 'clara@example.com', 'Career Advice', now() + interval '3 days 9 hours', 30, 'confirmed', 'demo_event_003', now()),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'David Kim', 'david@example.com', 'Code Review Session', now() + interval '4 days 11 hours', 30, 'declined', null, now());