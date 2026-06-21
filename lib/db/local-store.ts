import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Situation } from "@/lib/domain/types";
import type { DailyEntryRow, LearningStateRow, ProfileRow } from "./types";

// ============================================================================
// Lokaler Demo-Store (dateibasiert) — DEV-FALLBACK ohne Supabase.
// Greift automatisch, wenn keine Supabase-Keys gesetzt sind (siehe repo.ts),
// damit die App OHNE Account/Docker sofort testbar ist. Ein fixer Demo-User.
// In Produktion mit echten Keys wird dieser Pfad NIE benutzt.
// ============================================================================

export const LOCAL_USER_ID = "local-user";

interface LocalDb {
  profile: ProfileRow | null;
  entries: DailyEntryRow[];
  learning: LearningStateRow[];
}

const DATA_DIR = join(process.cwd(), ".localdata");
const DB_FILE = join(DATA_DIR, "db.json");

function read(): LocalDb {
  try {
    if (!existsSync(DB_FILE)) return { profile: null, entries: [], learning: [] };
    return JSON.parse(readFileSync(DB_FILE, "utf8")) as LocalDb;
  } catch {
    return { profile: null, entries: [], learning: [] };
  }
}

function write(db: LocalDb): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

export function localReset(): void {
  write({ profile: null, entries: [], learning: [] });
}

export function localGetProfile(): ProfileRow | null {
  return read().profile;
}

export function localUpsertProfile(patch: Partial<ProfileRow>): void {
  const db = read();
  const base: ProfileRow = db.profile ?? {
    id: LOCAL_USER_ID,
    goal: null,
    style: "nachhaltig",
    modalities: ["yoga", "joggen", "kraft"],
    favorite_workout: null,
    music_link: null,
    integrations: { google_calendar: false, sleep: false },
    rotation_index: 0,
  };
  db.profile = { ...base, ...patch, id: LOCAL_USER_ID };
  write(db);
}

export function localBumpRotation(): void {
  const db = read();
  if (db.profile) {
    db.profile.rotation_index += 1;
    write(db);
  }
}

export function localGetTodayEntry(date: string): DailyEntryRow | null {
  return read().entries.find((e) => e.date === date) ?? null;
}

export function localGetRecentEntries(limit: number): DailyEntryRow[] {
  return [...read().entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function localUpsertDailyEntry(row: DailyEntryRow): void {
  const db = read();
  const idx = db.entries.findIndex((e) => e.date === row.date);
  if (idx >= 0) db.entries[idx] = { ...db.entries[idx], ...row };
  else db.entries.push(row);
  write(db);
}

export function localUpdateDailyEntry(
  date: string,
  patch: Partial<DailyEntryRow>,
): void {
  const db = read();
  const idx = db.entries.findIndex((e) => e.date === date);
  if (idx >= 0) {
    db.entries[idx] = { ...db.entries[idx], ...patch };
    write(db);
  }
}

export function localGetLearningState(
  situation: Situation,
): LearningStateRow | null {
  return read().learning.find((l) => l.situation === situation) ?? null;
}

export function localSaveLearningState(row: LearningStateRow): void {
  const db = read();
  const idx = db.learning.findIndex((l) => l.situation === row.situation);
  if (idx >= 0) db.learning[idx] = row;
  else db.learning.push(row);
  write(db);
}
