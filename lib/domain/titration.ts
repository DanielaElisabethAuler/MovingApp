import { NO_SHOW_REASONS } from "@/config/noShowReasons";
import { SITUATION_CONFIG } from "@/config/situations";
import type {
  GradedOutcome,
  LearningState,
  NoShowReason,
  Situation,
} from "./types";

// ============================================================================
// Regelbasierte Titration — die RATSCHE (Spec 2.2, 2.3, 7.4).
//
// HARTE LEITPLANKEN, die dieser Code erzwingt:
//  - Das Tempo (Schrittweite) gehoert dem SYSTEM, nicht dem User. Es wird
//    NICHT als Regler exponiert — es lebt nur hier. (Spec 2.2)
//  - Die Ratsche zeigt nach OBEN. upper_edge_min ist die gerade-noch-machbare
//    Dosis UEBER dem Boden. Das taegliche Minimum (floor) senkt sie NIE ab. (2.3)
//  - KEIN Pro-User-ML in Phase 1 — eine transparente Regel. Phase 2 ersetzt
//    diese Funktion durch Bandit/Bayes, ohne dass UI/DB sich aendern.
// ============================================================================

// System-Tempo: feste Schrittweite (Minuten). NICHT in der UI exponiert.
export const DEFAULT_STEP_MIN = 5;

// Initiale Ober-Kanten-Schaetzung pro Situation, falls noch kein Lernstand
// existiert: seed aus der Situations-Config (handgesetzter Populations-Prior,
// Spec 2.4 / 9 "Populations-Prior beim Launch: handgesetzte Defaults").
export function seedLearningState(situation: Situation): LearningState {
  return {
    situation,
    upper_edge_min: SITUATION_CONFIG[situation].base_dose_min,
    step_min: DEFAULT_STEP_MIN,
  };
}

export interface TitrationInput {
  state: LearningState;
  graded: GradedOutcome;
  noShowReason?: NoShowReason;
  // Kalendarisch zugepackter Tag => No-Show ist Chaos/Rauschen, kein Dosis-
  // Signal (Spec 3.4). Kalender ist angebunden und liefert das automatisch.
  calendarPacked?: boolean;
}

export type TitrationDirection = "up" | "down" | "hold";

export interface TitrationResult {
  state: LearningState;
  direction: TitrationDirection;
  reason: string; // fuers Lern-Log: WARUM so titriert wurde
}

export function titrate(input: TitrationInput): TitrationResult {
  const { state, graded } = input;
  const step = state.step_min;

  // done_good -> Schritt HOCH. Auch wenn der Plan nur der Boden war: ein gut
  // bewerteter Boden-Tag treibt die Ober-Kante hoch (Ratsche nach oben).
  if (graded === "done_good") {
    return {
      state: { ...state, upper_edge_min: state.upper_edge_min + step },
      direction: "up",
      reason: "done_good: gut bewertet -> Ober-Kante einen Schritt hoch",
    };
  }

  // done_bad -> HALTEN (Warnzeichen, Spec 3.1).
  if (graded === "done_bad") {
    return {
      state,
      direction: "hold",
      reason: "done_bad: gemacht aber mies bewertet -> halten",
    };
  }

  // --- ab hier: no_show ---

  // Kalendarisch zugepackter Tag: kein Dosis-Signal, nur Rauschen (Spec 3.4).
  if (input.calendarPacked) {
    return {
      state,
      direction: "hold",
      reason: "no_show an zugepacktem Tag -> Chaos, kein Dosis-Signal (halten)",
    };
  }

  // No-Show-Grund entscheidet, ob das ein Dosis-Signal ist (Spec 3.4).
  const signal = input.noShowReason
    ? NO_SHOW_REASONS[input.noShowReason].doseSignal
    : "none";

  if (signal === "down") {
    // "war zu viel" -> Schritt RUNTER, aber nie unter 0 (= Boden-only).
    // Das "nie unter den Boden" wird zusaetzlich in proposePlan erzwungen.
    const next = Math.max(0, state.upper_edge_min - step);
    return {
      state: { ...state, upper_edge_min: next },
      direction: "down",
      reason: 'no_show "war zu viel" -> Ober-Kante einen Schritt runter (>= Boden)',
    };
  }

  // Zeit/Vergessen/Lust: kein Dosis-Signal -> halten (Spec 3.4).
  return {
    state,
    direction: "hold",
    reason: "no_show ohne Dosis-Grund (Timing/Motivation) -> halten",
  };
}
