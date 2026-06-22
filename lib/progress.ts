import { getRecentEntries } from "./db/repo";
import { computeStreak, type DayResult } from "./domain/streak";
import type { Outcome } from "./domain/types";

// Leitet aus dem Lern-Log (daily_entries) ab, was die Person schon verbessert
// hat — die "Regler" im Fortschritts-Fenster. Bewusst aus echten Daten, nicht
// geschoent: ohne Daten zeigt eine Metrik ehrlich "noch keine Daten".

export interface ProgressMetric {
  key: string;
  label: string;
  value: number; // 0..1
  caption: string;
  hasData: boolean;
}

export interface ProgressStats {
  phase: string; // kurzer Satz fuer den Chip
  streak: number;
  total: number;
  metrics: ProgressMetric[];
}

export async function getProgressStats(): Promise<ProgressStats> {
  const entries = await getRecentEntries(120);
  const logged = entries.filter((e) => e.outcome !== null);
  const total = logged.length;
  const done = logged.filter((e) => e.outcome === "done");

  const rate = (num: number, den: number) => (den > 0 ? num / den : 0);

  // Konsistenz: aufgetaucht / geloggt.
  const consistency = rate(done.length, total);

  // An schwachen Tagen dran (wenig Energie oder im Loch).
  const weak = logged.filter(
    (e) => e.situation === "wenig_energie" || e.situation === "im_loch",
  );
  const resilience = rate(weak.filter((e) => e.outcome === "done").length, weak.length);

  // Aus dem Loch zurueck.
  const loch = logged.filter((e) => e.situation === "im_loch");
  const comeback = rate(loch.filter((e) => e.outcome === "done").length, loch.length);

  // Dosis-Aufbau: Schnitt der ersten vs. zweiten Haelfte der erledigten Tage.
  const doneChrono = [...done].sort((a, b) => a.date.localeCompare(b.date));
  const growthData = doneChrono.length >= 4;
  let growth = 0;
  if (growthData) {
    const mid = Math.floor(doneChrono.length / 2);
    const avg = (arr: typeof doneChrono) =>
      arr.reduce((s, e) => s + e.proposed_plan.dose_min, 0) / arr.length;
    const first = avg(doneChrono.slice(0, mid));
    const second = avg(doneChrono.slice(mid));
    growth = first > 0 ? Math.max(0, Math.min(1, (second - first) / first)) : 0;
  }

  const days: DayResult[] = [...logged]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ outcome: e.outcome as Outcome, chaos: e.calendar_packed }));
  const streak = computeStreak(days).current;

  let phase: string;
  if (total === 0) phase = "Frisch dabei — heute zählt der erste Schritt.";
  else if (streak >= 7) phase = "Starke Kette — du bleibst dran.";
  else if (consistency >= 0.6) phase = "Du baust solide Konsistenz auf.";
  else phase = "Aufbau-Phase — jeder Tag zählt.";

  return {
    phase,
    streak,
    total,
    metrics: [
      {
        key: "consistency",
        label: "Konsistenz",
        value: consistency,
        caption: "Tage, an denen du aufgetaucht bist.",
        hasData: total > 0,
      },
      {
        key: "resilience",
        label: "An schwachen Tagen dran",
        value: resilience,
        caption: "Bewegung trotz wenig Energie oder Loch.",
        hasData: weak.length > 0,
      },
      {
        key: "comeback",
        label: "Aus dem Loch zurück",
        value: comeback,
        caption: "Aufgetaucht, wenn der Antrieb fehlte.",
        hasData: loch.length > 0,
      },
      {
        key: "growth",
        label: "Dosis-Aufbau",
        value: growth,
        caption: "Deine machbare Dosis wächst.",
        hasData: growthData,
      },
    ],
  };
}
