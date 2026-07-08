-- Sprint 3: lock down RLS. All app writes/reads go through server code using
-- the service-role key (which bypasses RLS), so these policies only govern
-- direct access via the public anon key (e.g. someone using supabase-js from
-- the browser console). After this migration the anon key can do nothing.

alter table bookings
  add constraint bookings_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

drop policy if exists "bookings_v1_read" on bookings;
drop policy if exists "bookings_v1_write" on bookings;

create policy "bookings_owner_select" on bookings
  for select using (auth.uid() = user_id);

create policy "bookings_owner_write" on bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
