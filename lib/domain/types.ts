// Kanonische Domaenen-Typen. Bewusst framework-agnostisch (kein Next/Supabase),
// damit Phase 2 die Lernregeln ersetzen kann, ohne UI/DB anzufassen.

export type Situation =
  | "gut"
  | "wenig_energie"
  | "keine_zeit"
  | "anderes_wichtiger"
  | "im_loch";

export const SITUATIONS: Situation[] = [
  "gut",
  "wenig_energie",
  "keine_zeit",
  "anderes_wichtiger",
  "im_loch",
];

export type Style = "ambitioniert" | "nachhaltig" | "dranbleiben";

export type Outcome = "no_show" | "done";

// Verfeinerung von "done" anhand des post_score (siehe reward.ts).
export type GradedOutcome = "no_show" | "done_bad" | "done_good";

export type NoShowReason =
  | "keine_zeit"
  | "war_zu_viel"
  | "keine_lust"
  | "vergessen";

// Wie der Lern-Loop ein No-Show verbucht. NICHT-entschiedene Punkte aus
// Abschnitt 9 sind ueber config/* steuerbar — hier nur die moeglichen Signale.
export type DoseSignal = "down" | "none";

export type Modality = string; // konfigurierbar, default [yoga, joggen, kraft]

export interface ProposedPlan {
  modality: Modality;
  dose_min: number;
  timing: string;
  fragments?: number[]; // z.B. [15,15,15,15] fuer 4x15 bei "keine_zeit"
  is_floor_only: boolean;
}

// Pro (User, Situation): aktuelle Ober-Kanten-Schaetzung + Schrittregel.
// Phase 1 regelbasiert; Spalten so benannt, dass Phase-2-Bandit-Parameter
// daneben passen.
export interface LearningState {
  situation: Situation;
  upper_edge_min: number; // gerade-noch-machbare Dosis ueber dem Boden
  step_min: number; // aktuelle Schrittweite
}
