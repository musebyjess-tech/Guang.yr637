-- Celestial Codex: run in Supabase SQL Editor

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('text', 'image', 'voice')),
  content text not null,
  color text not null,
  sender_name text not null,
  timestamp timestamptz not null default now(),
  star_x double precision not null,
  star_y double precision not null
);

alter table public.messages enable row level security;

create policy "Allow public read" on public.messages
  for select using (true);

create policy "Allow public insert" on public.messages
  for insert with check (true);

-- Storage bucket (create in Dashboard or via API): codex-media
-- Set bucket to public for image/audio URLs
