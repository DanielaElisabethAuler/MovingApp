import { randomUUID } from "node:crypto";
import { seedLearningState } from "@/lib/domain/titration";
import type { LearningState, Situation } from "@/lib/domain/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  LOCAL_USER_ID,
  localBumpRotation,
  localGetLearningState,
  localGetProfile,
  localGetRecentEntries,
  localGetPlanned,
  localGetTodayEntry,
  localRemovePlanned,
  localReset,
  localSaveLearningState,
  localUpdateDailyEntry,
  localUpsertDailyEntry,
  localUpsertPlanned,
  localUpsertProfile,
} from "./local-store";
import type {
  DailyEntryRow,
  LearningStateRow,
  PlannedRow,
  ProfileRow,
} from "./types";

// Datenzugriff. Brancht zwischen lokalem Demo-Store (kein Supabase noetig) und
// Supabase (RLS-geschuetzt). Die Geschaeftslogik lebt in lib/domain/*; hier nur
// Lesen/Schreiben. `LOCAL` greift automatisch, wenn keine Keys gesetzt sind.
const LOCAL = !hasSupabaseEnv();

// --- Reads ------------------------------------------------------------------
export async function getCurrentUserId(): Promise<string | null> {
  if (LOCAL) return LOCAL_USER_ID;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// E-Mail des angemeldeten Accounts (zum Pruefen, ob beide Geraete derselbe sind).
export async function getCurrentUserEmail(): Promise<string | null> {
  if (LOCAL) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export async function getProfile(): Promise<ProfileRow | null> {
  if (LOCAL) return localGetProfile();
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").maybeSingle();
  return (data as ProfileRow | null) ?? null;
}

export async function getTodayEntry(date: string): Promise<DailyEntryRow | null> {
  if (LOCAL) return localGetTodayEntry(date);
  const supabase = createClient();
  const { data } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  return (data as DailyEntryRow | null) ?? null;
}

export async function getRecentEntries(limit = 30): Promise<DailyEntryRow[]> {
  if (LOCAL) return localGetRecentEntries(limit);
  const supabase = createClient();
  const { data } = await supabase
    .from("daily_entries")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  return (data as DailyEntryRow[] | null) ?? [];
}

// Lernstand lesen — oder mit Populations-Prior seeden (Spec 2.4 / 9).
export async function getLearningState(
  situation: Situation,
): Promise<LearningState> {
  let row: LearningStateRow | null;
  if (LOCAL) {
    row = localGetLearningState(situation);
  } else {
    const supabase = createClient();
    const { data } = await supabase
      .from("learning_state")
      .select("*")
      .eq("situation", situation)
      .maybeSingle();
    row = data as LearningStateRow | null;
  }
  if (!row) return seedLearningState(situation);
  return { situation, upper_edge_min: row.upper_edge_min, step_min: row.step_min };
}

// --- Writes -----------------------------------------------------------------
export async function upsertProfile(
  userId: string,
  data: Partial<ProfileRow>,
): Promise<{ error?: string }> {
  if (LOCAL) {
    localUpsertProfile(data);
    return {};
  }
  const supabase = createClient();
  const { error } = await supabase.from("profiles").upsert({ id: userId, ...data });
  return { error: error?.message };
}

export async function bumpRotation(
  userId: string,
  current: number,
): Promise<void> {
  if (LOCAL) {
    localBumpRotation();
    return;
  }
  const supabase = createClient();
  await supabase
    .from("profiles")
    .update({ rotation_index: current + 1 })
    .eq("id", userId);
}

export type DailyEntryInsert = Omit<DailyEntryRow, "id" | "created_at">;

export async function upsertDailyEntry(
  row: DailyEntryInsert,
): Promise<{ error?: string }> {
  if (LOCAL) {
    localUpsertDailyEntry({
      ...row,
      id: randomUUID(),
      created_at: new Date().toISOString(),
    });
    return {};
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("daily_entries")
    .upsert(row, { onConflict: "user_id,date" });
  return { error: error?.message };
}

export async function updateDailyEntry(
  date: string,
  patch: Partial<DailyEntryRow>,
): Promise<{ error?: string }> {
  if (LOCAL) {
    localUpdateDailyEntry(date, patch);
    return {};
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("daily_entries")
    .update(patch)
    .eq("date", date);
  return { error: error?.message };
}

export async function saveLearningState(
  userId: string,
  state: LearningState,
): Promise<void> {
  if (LOCAL) {
    localSaveLearningState({
      user_id: LOCAL_USER_ID,
      situation: state.situation,
      upper_edge_min: state.upper_edge_min,
      step_min: state.step_min,
    });
    return;
  }
  const supabase = createClient();
  await supabase.from("learning_state").upsert({
    user_id: userId,
    situation: state.situation,
    upper_edge_min: state.upper_edge_min,
    step_min: state.step_min,
    updated_at: new Date().toISOString(),
  });
}

export function isLocalMode(): boolean {
  return LOCAL;
}

// --- Geplante Workouts ------------------------------------------------------
export async function getPlannedWorkouts(): Promise<PlannedRow[]> {
  if (LOCAL) return localGetPlanned();
  const supabase = createClient();
  const { data } = await supabase
    .from("planned_workouts")
    .select("date, modality, time");
  return (data as PlannedRow[] | null) ?? [];
}

export async function planWorkout(
  userId: string,
  date: string,
  modality: string,
  time: string | null,
): Promise<void> {
  if (LOCAL) {
    localUpsertPlanned(date, modality, time);
    return;
  }
  const supabase = createClient();
  await supabase
    .from("planned_workouts")
    .upsert({ user_id: userId, date, modality, time }, { onConflict: "user_id,date" });
}

export async function unplanWorkout(userId: string, date: string): Promise<void> {
  if (LOCAL) {
    localRemovePlanned(date);
    return;
  }
  const supabase = createClient();
  await supabase.from("planned_workouts").delete().eq("date", date);
}

// Konto/Profil loeschen: alle eigenen Daten entfernen (RLS erlaubt das fuer die
// eigenen Zeilen) und ausloggen. Im Demo-Modus = lokalen Store leeren.
export async function deleteUserData(userId: string): Promise<void> {
  if (LOCAL) {
    localReset();
    return;
  }
  const supabase = createClient();
  await supabase.from("daily_entries").delete().eq("user_id", userId);
  await supabase.from("learning_state").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);
  await supabase.auth.signOut();
}
