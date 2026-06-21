-- ============================================================================
-- Phase-1-Schema (Spec Abschnitt 6). Spiegelt User / DailyEntry / LearningState.
-- Das LERN-LOG (daily_entries) ist das Asset: jeder Tag wird vollstaendig
-- geloggt (context, dose, outcome, reward), damit Phase 2 darauf aufsetzt.
--
-- Row Level Security: jeder User sieht/schreibt nur seine eigenen Zeilen.
-- ============================================================================

-- --- Enums ------------------------------------------------------------------
do $$ begin
  create type style as enum ('ambitioniert', 'nachhaltig', 'dranbleiben');
exception when duplicate_object then null; end $$;

do $$ begin
  create type situation as enum
    ('gut', 'wenig_energie', 'keine_zeit', 'anderes_wichtiger', 'im_loch');
exception when duplicate_object then null; end $$;

do $$ begin
  create type outcome as enum ('no_show', 'done');
exception when duplicate_object then null; end $$;

do $$ begin
  -- Set bleibt erweiterbar (Spec 9: konkrete No-Show-Optionen offen gehalten).
  create type no_show_reason as enum
    ('keine_zeit', 'war_zu_viel', 'keine_lust', 'vergessen');
exception when duplicate_object then null; end $$;

-- --- profiles (1:1 zu auth.users) -------------------------------------------
create table if not exists profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  goal             text,                      -- Wohin (enum oder Freitext)
  style            style not null default 'nachhaltig',
  modalities       text[] not null default '{yoga,joggen,kraft}',
  favorite_workout text,
  music_link       text,                      -- fuer "im Loch"
  integrations     jsonb not null default '{"google_calendar": false, "sleep": false}',
  rotation_index   int not null default 0,
  created_at       timestamptz not null default now()
);

-- --- daily_entries (das Lern-Log) -------------------------------------------
create table if not exists daily_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  date              date not null,
  -- Kontext
  situation         situation not null,
  pre_score         real not null,            -- aus situation (spaeter Schlaf/Kalender)
  floor_offer       int not null,             -- das vom User angegebene Kleinstmoegliche
  -- Vorschlag
  proposed_plan     jsonb not null,           -- {modality, dose_min, timing, fragments?, is_floor_only}
  rotation_modality text,
  calendar_packed   boolean not null default false, -- Chaos-Tag-Marker (Spec 3.4)
  -- Ergebnis
  outcome           outcome,                  -- no_show | done (null = offen)
  no_show_reason    no_show_reason,
  post_feeling      int,                       -- Slider 0..100 -> post_score
  -- Lernen
  reward            real,                      -- base(outcome) + W*(post-pre) (Spec 3.3)
  advanced_rotation boolean not null default false,
  streak_forgiven   boolean not null default false, -- never miss twice (Spec 3.5)
  created_at        timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists daily_entries_user_date_idx
  on daily_entries (user_id, date desc);

-- --- learning_state (pro User x Situation) ----------------------------------
-- Phase 1 regelbasiert. Spalten so benannt, dass Phase-2-Bandit-Parameter
-- (z.B. posterior mean/var) daneben passen, ohne Migration der Bestandsdaten.
create table if not exists learning_state (
  user_id        uuid not null references auth.users (id) on delete cascade,
  situation      situation not null,
  upper_edge_min real not null,               -- gerade-noch-machbare Dosis ueber Boden
  step_min       real not null default 5,     -- System-Tempo (NICHT in UI exponiert)
  updated_at     timestamptz not null default now(),
  primary key (user_id, situation)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles       enable row level security;
alter table daily_entries  enable row level security;
alter table learning_state enable row level security;

-- profiles: nur eigenes Profil
drop policy if exists "profiles_self" on profiles;
create policy "profiles_self" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- daily_entries: nur eigene Eintraege
drop policy if exists "daily_entries_self" on daily_entries;
create policy "daily_entries_self" on daily_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- learning_state: nur eigener Lernstand
drop policy if exists "learning_state_self" on learning_state;
create policy "learning_state_self" on learning_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Auto-Profil bei Signup
-- ============================================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
