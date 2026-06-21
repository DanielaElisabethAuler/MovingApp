import type { Outcome } from "./types";

// ============================================================================
// Streak-Regel: NEVER MISS TWICE (Spec 3.5).
//  - Ein einzelner verpasster Tag bricht den Streak NICHT.
//  - Erst der ZWEITE verpasste Tag in Folge bricht ihn.
//  - Ausnahme: kalendarisch erklaerter Chaos-Tag zaehlt gar nicht als Miss
//    (Spec 3.4) — neutral, weder Bruch noch Fortschritt.
//
// WICHTIG fuers Lernen (Spec 3.5): ein "verziehener" Tag bleibt fuers Lern-Log
// trotzdem ein geloggtes No-Show (mit Grund). "Verziehen" heisst nur
// "Streak bleibt", nicht "Signal geloescht".
// ============================================================================

export interface DayResult {
  outcome: Outcome;
  // Chaos-Tag (Kalender zugepackt / erklaert): aus der Streak-Logik ausgenommen.
  chaos?: boolean;
}

// Entscheidet beim Loggen eines No-Show, ob er den Streak haelt (verziehen).
// history = vorangegangene Tage, chronologisch (aeltester zuerst).
export function missIsForgiven(
  history: DayResult[],
  isChaos: boolean,
): boolean {
  // Chaos-Tag: Streak bleibt, aber aus anderem Grund (3.4) — nie ein Bruch.
  if (isChaos) return true;

  // Letzter NICHT-Chaos-Tag bestimmt, ob das hier der erste oder zweite Miss ist.
  const lastReal = [...history].reverse().find((d) => !d.chaos);

  // Kein realer Vortag -> erster Miss ueberhaupt -> verziehen.
  if (!lastReal) return true;

  // Verziehen, solange der Vortag KEIN Miss war (never miss twice).
  return lastReal.outcome === "done";
}

export interface StreakState {
  current: number; // aktueller Streak
  longest: number; // laengster Streak in der Historie
}

// Berechnet den Streak ueber die gesamte Historie (chronologisch).
export function computeStreak(days: DayResult[]): StreakState {
  let current = 0;
  let longest = 0;
  let prevWasMiss = false;

  for (const day of days) {
    if (day.chaos) continue; // neutral, ueberspringen

    if (day.outcome === "done") {
      current += 1;
      prevWasMiss = false;
    } else {
      // no_show
      if (prevWasMiss) {
        // zweiter Miss in Folge -> Bruch
        current = 0;
      } else {
        // erster Miss -> verziehen, Streak haelt (kein Increment)
        prevWasMiss = true;
      }
    }

    if (current > longest) longest = current;
  }

  return { current, longest };
}
