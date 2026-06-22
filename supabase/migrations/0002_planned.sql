-- Geplante Workouts (im Kalender fuer kommende Tage vormerken).
create table if not exists planned_workouts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       date not null,
  modality   text not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table planned_workouts enable row level security;

drop policy if exists "planned_self" on planned_workouts;
create policy "planned_self" on planned_workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
