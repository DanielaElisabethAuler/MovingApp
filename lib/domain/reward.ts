import type { GradedOutcome, Outcome } from "./types";

// ============================================================================
// Reward = base(outcome) + W * (post_score - pre_score)   (Spec 3.3)
// Delta, NICHT Absolutwert: eine Einheit, die von "im Loch" auf "okay" hebt,
// zaehlt als voller Treffer. Gewichte sind Tuning (Spec 3.3).
// ============================================================================

export const REWARD_BASE: Record<GradedOutcome, number> = {
  no_show: -1.0,
  done_bad: -0.2,
  done_good: +1.0,
};

// Gewicht des Delta-Terms.
export const DELTA_WEIGHT = 1.0;

// Ab welchem post_score (0..1) gilt eine Einheit als "done_good" statt "done_bad".
// Spec 3.1: "gemacht, aber mies bewertet" = Warnzeichen.
export const DONE_GOOD_THRESHOLD = 0.6;

// Verfeinert "done" anhand des Befindens nach der Einheit.
export function gradeOutcome(
  outcome: Outcome,
  postScore?: number,
): GradedOutcome {
  if (outcome === "no_show") return "no_show";
  if (postScore !== undefined && postScore >= DONE_GOOD_THRESHOLD) {
    return "done_good";
  }
  return "done_bad";
}

export interface RewardInput {
  outcome: Outcome;
  preScore: number; // 0..1 aus der Situation
  postScore?: number; // 0..1 aus dem Slider; fehlt bei no_show
}

export interface RewardResult {
  graded: GradedOutcome;
  reward: number;
}

export function computeReward(input: RewardInput): RewardResult {
  const graded = gradeOutcome(input.outcome, input.postScore);
  const base = REWARD_BASE[graded];

  // No-Show liefert kein post_feeling -> nur die Basisstrafe, kein Delta-Term.
  if (input.outcome === "no_show" || input.postScore === undefined) {
    return { graded, reward: base };
  }

  const delta = input.postScore - input.preScore;
  return { graded, reward: base + DELTA_WEIGHT * delta };
}
