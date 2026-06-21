"use server";

import { revalidatePath } from "next/cache";
import { getCalendarProvider } from "@/lib/calendar";
import { todayStr } from "@/lib/date";
import {
  bumpRotation,
  getCurrentUserId,
  getLearningState,
  getProfile,
  getRecentEntries,
  getTodayEntry,
  saveLearningState,
  updateDailyEntry,
  upsertDailyEntry,
  upsertProfile,
} from "@/lib/db/repo";
import { proposePlan } from "@/lib/domain/proposePlan";
import { computeReward } from "@/lib/domain/reward";
import { postScore, preScoreFor } from "@/lib/domain/scoring";
import { missIsForgiven, type DayResult } from "@/lib/domain/streak";
import { titrate } from "@/lib/domain/titration";
import type { NoShowReason, Outcome, Situation, Style } from "@/lib/domain/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// --- Demo-Modus: lokalen Store zuruecksetzen (nur ohne Supabase) ------------
export async function resetDemo(): Promise<ActionResult> {
  const { isLocalMode } = await import("@/lib/db/repo");
  if (!isLocalMode()) return { ok: false, error: "Nur im Demo-Modus." };
  const { localReset } = await import("@/lib/db/local-store");
  localReset();
  revalidatePath("/");
  revalidatePath("/history");
  return { ok: true };
}

// --- Onboarding -------------------------------------------------------------
export async function saveProfile(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Nicht eingeloggt." };

  const modalities = (formData.get("modalities") as string)
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  const { error } = await upsertProfile(userId, {
    goal: (formData.get("goal") as string) || null,
    style: (formData.get("style") as Style) || "nachhaltig",
    modalities: modalities.length ? modalities : ["yoga", "joggen", "kraft"],
    favorite_workout: (formData.get("favorite_workout") as string) || null,
    music_link: (formData.get("music_link") as string) || null,
    integrations: {
      google_calendar: formData.get("google_calendar") === "on",
      sleep: false,
    },
  });

  if (error) return { ok: false, error };
  revalidatePath("/");
  return { ok: true };
}

// --- Tagesflow Schritt 1: Situation + Boden -> Plan vorschlagen + loggen -----
export async function startDay(input: {
  situation: Situation;
  floorOffer: number;
}): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Nicht eingeloggt." };

  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Kein Profil." };

  const date = todayStr();
  const calendar = getCalendarProvider();
  const now = new Date();
  const calendarPacked = await calendar.isPackedDay(now);

  // Bei "keine Zeit": ersten freien Slot als Timing vorschlagen (Spec 4/5).
  let calendarSlot: string | undefined;
  if (input.situation === "keine_zeit") {
    const slots = await calendar.getFreeSlots(now);
    calendarSlot = slots[0]?.label;
  }

  const rotationModality =
    profile.modalities[profile.rotation_index % profile.modalities.length] ??
    profile.modalities[0];

  const learning = await getLearningState(input.situation);

  const plan = proposePlan({
    situation: input.situation,
    style: profile.style,
    floorOffer: input.floorOffer,
    learning,
    userModalities: profile.modalities,
    rotationModality,
    favoriteWorkout: profile.favorite_workout ?? undefined,
    calendarSlot,
  });

  const { error } = await upsertDailyEntry({
    user_id: userId,
    date,
    situation: input.situation,
    pre_score: preScoreFor(input.situation),
    floor_offer: input.floorOffer,
    proposed_plan: plan,
    rotation_modality: rotationModality,
    calendar_packed: calendarPacked,
    outcome: null,
    no_show_reason: null,
    post_feeling: null,
    reward: null,
    advanced_rotation: false,
    streak_forgiven: false,
  });

  if (error) return { ok: false, error };
  revalidatePath("/");
  return { ok: true };
}

// --- Tagesflow Schritt 2a: done -> Slider -> Reward + Titration hoch/halten --
export async function completeDay(input: {
  postFeeling: number;
}): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Nicht eingeloggt." };

  const date = todayStr();
  const entry = await getTodayEntry(date);
  if (!entry) return { ok: false, error: "Kein Eintrag fuer heute." };

  const ps = postScore(input.postFeeling);
  const { graded, reward } = computeReward({
    outcome: "done",
    preScore: entry.pre_score,
    postScore: ps,
  });

  // Titration (Ratsche). done ist immer ein Signal -> Chaos-Tag irrelevant.
  const learning = await getLearningState(entry.situation);
  const result = titrate({ state: learning, graded });
  await saveLearningState(userId, result.state);

  // Rotation weiterdrehen (nur bei done).
  const profile = await getProfile();
  if (profile) await bumpRotation(userId, profile.rotation_index);

  const { error } = await updateDailyEntry(date, {
    outcome: "done" satisfies Outcome,
    post_feeling: input.postFeeling,
    reward,
    advanced_rotation: true,
  });

  if (error) return { ok: false, error };
  revalidatePath("/");
  revalidatePath("/history");
  return { ok: true };
}

// --- Tagesflow Schritt 2b: no_show -> Grund -> Streak/Titration --------------
export async function missDay(input: {
  reason: NoShowReason;
}): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Nicht eingeloggt." };

  const date = todayStr();
  const entry = await getTodayEntry(date);
  if (!entry) return { ok: false, error: "Kein Eintrag fuer heute." };

  // Streak: never miss twice. Historie chronologisch (ohne heute) aufbauen.
  const recent = await getRecentEntries(40);
  const history: DayResult[] = recent
    .filter((e) => e.date !== date && e.outcome !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ outcome: e.outcome as Outcome, chaos: e.calendar_packed }));
  const forgiven = missIsForgiven(history, entry.calendar_packed);

  // Reward (No-Show = staerkste Strafe, kein Delta-Term, Spec 3.3).
  const { reward } = computeReward({ outcome: "no_show", preScore: entry.pre_score });

  // Titration: nur "war zu viel" an Nicht-Chaos-Tag senkt die Dosis (Spec 3.4).
  const learning = await getLearningState(entry.situation);
  const result = titrate({
    state: learning,
    graded: "no_show",
    noShowReason: input.reason,
    calendarPacked: entry.calendar_packed,
  });
  await saveLearningState(userId, result.state);

  const { error } = await updateDailyEntry(date, {
    outcome: "no_show" satisfies Outcome,
    no_show_reason: input.reason,
    reward,
    streak_forgiven: forgiven,
  });

  if (error) return { ok: false, error };
  revalidatePath("/");
  revalidatePath("/history");
  return { ok: true };
}
