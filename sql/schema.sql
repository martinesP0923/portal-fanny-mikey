-- =========================================================
-- Esquema de base de datos — Portal de Comunicaciones
-- I.E.D. Fanny Mikey
-- Pega TODO este archivo en: Supabase → SQL Editor → New query → Run
-- =========================================================

-- 1) EMISORA: canciones solicitadas por los estudiantes
create table if not exists song_requests (
  id uuid primary key default gen_random_uuid(),
  song_name text not null,
  artist text not null,
  requested_by text,               -- nombre de quien pide la canción (opcional)
  message text,                    -- dedicatoria o mensaje (opcional)
  status text not null default 'pendiente', -- pendiente | reproducida
  created_at timestamptz not null default now()
);

-- 2) EMISORA: qué se está reproduciendo ahora mismo (el locutor la actualiza)
create table if not exists now_playing (
  id int primary key default 1,
  song_name text,
  artist text,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into now_playing (id, song_name, artist)
values (1, null, null)
on conflict (id) do nothing;

-- 3) DANZA Y TEATRO: publicaciones (título, contenido, 1 foto, 1 video)
create table if not exists dance_theater_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  photo_url text,
  video_url text,
  created_at timestamptz not null default now()
);

-- 4) NOTICIAS: publicaciones estilo diagramación de noticia
create table if not exists news_posts (
  id uuid primary key default gen_random_uuid(),
  epigrafe text,          -- antetítulo pequeño arriba del titular
  titular text not null,  -- título principal
  bajada text,            -- subtítulo / bajada
  cuerpo text not null,   -- cuerpo de la noticia
  photo_url_1 text,
  photo_url_2 text,
  video_url text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- SEGURIDAD (Row Level Security)
-- Regla general: cualquier visitante puede LEER.
-- Solo un usuario autenticado (los presentadores) puede
-- crear, editar o eliminar contenido.
-- Excepción: las solicitudes de canciones las puede crear
-- cualquier visitante (sin login), porque son los estudiantes
-- quienes piden canciones desde la página pública.
-- =========================================================

alter table song_requests enable row level security;
alter table now_playing enable row level security;
alter table dance_theater_posts enable row level security;
alter table news_posts enable row level security;

-- song_requests: cualquiera puede insertar (pedir canción) y leer
drop policy if exists "song_requests_public_insert" on song_requests;
create policy "song_requests_public_insert" on song_requests
  for insert to anon, authenticated with check (true);
drop policy if exists "song_requests_public_read" on song_requests;
create policy "song_requests_public_read" on song_requests
  for select to anon, authenticated using (true);
-- solo el presentador autenticado puede editar/eliminar (ej. marcar reproducida)
drop policy if exists "song_requests_auth_update" on song_requests;
create policy "song_requests_auth_update" on song_requests
  for update to authenticated using (true);
drop policy if exists "song_requests_auth_delete" on song_requests;
create policy "song_requests_auth_delete" on song_requests
  for delete to authenticated using (true);

-- now_playing: lectura pública, solo el presentador actualiza
drop policy if exists "now_playing_public_read" on now_playing;
create policy "now_playing_public_read" on now_playing
  for select to anon, authenticated using (true);
drop policy if exists "now_playing_auth_update" on now_playing;
create policy "now_playing_auth_update" on now_playing
  for update to authenticated using (true);

-- dance_theater_posts: lectura pública, escritura solo autenticado
drop policy if exists "dance_public_read" on dance_theater_posts;
create policy "dance_public_read" on dance_theater_posts
  for select to anon, authenticated using (true);
drop policy if exists "dance_auth_insert" on dance_theater_posts;
create policy "dance_auth_insert" on dance_theater_posts
  for insert to authenticated with check (true);
drop policy if exists "dance_auth_update" on dance_theater_posts;
create policy "dance_auth_update" on dance_theater_posts
  for update to authenticated using (true);
drop policy if exists "dance_auth_delete" on dance_theater_posts;
create policy "dance_auth_delete" on dance_theater_posts
  for delete to authenticated using (true);

-- news_posts: lectura pública, escritura solo autenticado
drop policy if exists "news_public_read" on news_posts;
create policy "news_public_read" on news_posts
  for select to anon, authenticated using (true);
drop policy if exists "news_auth_insert" on news_posts;
create policy "news_auth_insert" on news_posts
  for insert to authenticated with check (true);
drop policy if exists "news_auth_update" on news_posts;
create policy "news_auth_update" on news_posts
  for update to authenticated using (true);
drop policy if exists "news_auth_delete" on news_posts;
create policy "news_auth_delete" on news_posts
  for delete to authenticated using (true);

-- =========================================================
-- ALMACENAMIENTO (Storage) para fotos y videos
-- Ejecuta esto también; crea un bucket público llamado "media"
-- =========================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
drop policy if exists "media_auth_upload" on storage.objects;
create policy "media_auth_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
drop policy if exists "media_auth_delete" on storage.objects;
create policy "media_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
