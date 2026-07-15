-- Cadence — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query).
-- Creates two tables, scoped to a single authenticated user via Row Level Security.

create table if not exists public.events (
  id           uuid primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  ts           bigint not null,        -- epoch millis, matches the app's event.ts
  date_key     text not null,          -- 'YYYY-MM-DD', the tracking day this event belongs to
  audience     text not null,          -- 'seller' | 'buyer' | 'landlord'
  kind         text not null,          -- 'call' | 'followup' | 'adjust'
  label        text not null,
  deltas       jsonb not null,
  created_at   timestamptz not null default now()
);

create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_user_date_idx on public.events(user_id, date_key);

alter table public.events enable row level security;

drop policy if exists "events_select_own" on public.events;
drop policy if exists "events_insert_own" on public.events;
drop policy if exists "events_update_own" on public.events;
drop policy if exists "events_delete_own" on public.events;

create policy "events_select_own" on public.events
  for select using (auth.uid() = user_id);
create policy "events_insert_own" on public.events
  for insert with check (auth.uid() = user_id);
create policy "events_update_own" on public.events
  for update using (auth.uid() = user_id);
create policy "events_delete_own" on public.events
  for delete using (auth.uid() = user_id);

-- RLS filters *rows*, but Postgres still requires a base table grant before
-- a role may query it at all. Only signed-in users (role "authenticated")
-- should ever reach these tables — never the anonymous "anon" role.
grant select, insert, update, delete on public.events to authenticated;

-- One settings row per user: daily goals + last-selected audience.
create table if not exists public.settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  goals         jsonb not null default '{"call":25,"meetingCompleted":3}'::jsonb,
  audience      text not null default 'seller',
  updated_at    timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_select_own" on public.settings;
drop policy if exists "settings_insert_own" on public.settings;
drop policy if exists "settings_update_own" on public.settings;

create policy "settings_select_own" on public.settings
  for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.settings
  for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.settings
  for update using (auth.uid() = user_id);

grant select, insert, update on public.settings to authenticated;
