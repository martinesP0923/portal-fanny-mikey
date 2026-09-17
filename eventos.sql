-- =========================================================
-- TABLA NUEVA: EVENTOS
-- Pega esto en Supabase → SQL Editor → New query → Run
-- (No afecta las tablas que ya tienes, solo agrega esta nueva)
-- =========================================================

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_date date,
  location text,
  photo_url text,
  created_at timestamptz not null default now()
);

alter table events enable row level security;

drop policy if exists "events_public_read" on events;
create policy "events_public_read" on events
  for select to anon, authenticated using (true);

drop policy if exists "events_auth_insert" on events;
create policy "events_auth_insert" on events
  for insert to authenticated with check (true);

drop policy if exists "events_auth_update" on events;
create policy "events_auth_update" on events
  for update to authenticated using (true);

drop policy if exists "events_auth_delete" on events;
create policy "events_auth_delete" on events
  for delete to authenticated using (true);
