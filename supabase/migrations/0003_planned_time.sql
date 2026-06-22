-- Uhrzeit fuer geplante Workouts (aus freien Kalender-Slots gewaehlt).
alter table planned_workouts add column if not exists time text;
