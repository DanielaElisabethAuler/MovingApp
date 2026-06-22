import type { Situation } from "./types";

// "Rate erst, frag dann": aus dem Kontext eine Vermutung bilden, damit aus
// fuenf kalten Entscheidungen eine Bestaetigung wird. Phase 1 nutzt nur den
// Kalender; Phase 2 ergaenzt Schlaf/Verlauf — dann wird die Vermutung besser.
export interface SituationGuess {
  situation: Situation;
  reason: string; // kurze Begruendung ("die App kennt mich")
}

export function guessSituation(ctx: { calendarPacked: boolean }): SituationGuess {
  if (ctx.calendarPacked) {
    return {
      situation: "keine_zeit",
      reason: "Dein Kalender ist heute ziemlich voll.",
    };
  }
  // Ohne weiteres Signal: entspannte, optimistische Default-Vermutung.
  return { situation: "gut", reason: "Sieht entspannt aus heute." };
}
