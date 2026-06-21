import { SITUATION_CONFIG } from "@/config/situations";
import type { Situation } from "./types";

// Slider-Bereich, den die UI dem User zeigt (Spec 3.2: clean ziehbar).
export const SLIDER_MIN = 0;
export const SLIDER_MAX = 100;

// Der Slider sieht clean aus, mappt intern aber auf einen numerischen
// post_score in 0..1 — sonst kann der Delta-Reward (3.3) nicht rechnen.
export function postScore(sliderValue: number): number {
  const clamped = Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, sliderValue));
  return (clamped - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
}

// Eingangs-Befinden (0..1) aus der Tagessituation. Phase 2: aus Schlaf/Kalender.
export function preScoreFor(situation: Situation): number {
  return SITUATION_CONFIG[situation].pre_score;
}
