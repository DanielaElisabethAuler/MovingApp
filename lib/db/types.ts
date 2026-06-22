import type { PlanProposal } from "@/lib/domain/proposePlan";
import type { NoShowReason, Outcome, Situation, Style } from "@/lib/domain/types";

export interface ProfileRow {
  id: string;
  goal: string | null;
  style: Style;
  modalities: string[];
  favorite_workout: string | null;
  music_link: string | null;
  integrations: { google_calendar: boolean; sleep: boolean };
  rotation_index: number;
}

export interface DailyEntryRow {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  situation: Situation;
  pre_score: number;
  floor_offer: number;
  proposed_plan: PlanProposal;
  rotation_modality: string | null;
  calendar_packed: boolean;
  outcome: Outcome | null;
  no_show_reason: NoShowReason | null;
  post_feeling: number | null;
  reward: number | null;
  advanced_rotation: boolean;
  streak_forgiven: boolean;
  created_at: string;
}

export interface LearningStateRow {
  user_id: string;
  situation: Situation;
  upper_edge_min: number;
  step_min: number;
}

export interface PlannedRow {
  user_id: string;
  date: string; // YYYY-MM-DD
  modality: string;
}
