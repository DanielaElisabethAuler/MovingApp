import type { DoseSignal, NoShowReason } from "@/lib/domain/types";

// ============================================================================
// OFFENER PUNKT aus Spec Abschnitt 9: "konkrete No-Show-Optionen".
// In diesem Gespraech entschieden: alle 4 Gruende unten. Jeder Grund traegt
// ein eigenes Lern-Signal — das ist der Kern von Spec 3.4 (No-Show ist das
// staerkste UND mehrdeutigste Signal). Set + Mapping bleiben hier editierbar.
// ============================================================================

export interface NoShowReasonConfig {
  reason: NoShowReason;
  label: string; // anklickbarer Text (kein Freitext, Spec 3.4)
  // Wirkung auf die Titration:
  //  "down"  => Dosis war zu hoch -> Schritt runter (nie unter Boden)
  //  "none"  => Timing/Motivation/Chaos -> KEIN Dosis-Schritt
  doseSignal: DoseSignal;
  // Interpretations-Hinweis fuer Phase 2 (Modalitaet wechseln, Timing lernen, ...).
  note: string;
}

export const NO_SHOW_REASONS: Record<NoShowReason, NoShowReasonConfig> = {
  // Timing/Kalender — NICHT als "Dosis zu hoch" verbuchen (Spec 3.4).
  keine_zeit: {
    reason: "keine_zeit",
    label: "Keine Zeit gehabt",
    doseSignal: "none",
    note: "Timing/Kalender-Signal. Bei zugepacktem Tag ohnehin Chaos-Tag (kein Signal).",
  },
  // Das einzige eindeutige "Dosis zu hoch"-Signal.
  war_zu_viel: {
    reason: "war_zu_viel",
    label: "War zu viel",
    doseSignal: "down",
    note: "Eindeutig zu hohe Dosis -> Schritt runter (nie unter den Boden).",
  },
  // Modalitaet/Motivation — eher Richtung "im Loch"-Behandlung, nicht Dosis.
  keine_lust: {
    reason: "keine_lust",
    label: "Keine Lust",
    doseSignal: "none",
    note: "Motivation/Modalitaet. Phase 2: Modalitaet variieren, nicht Dosis senken.",
  },
  // Reminder/Timing — keine Dosis-Aussage.
  vergessen: {
    reason: "vergessen",
    label: "Vergessen",
    doseSignal: "none",
    note: "Reminder/JITAI-Timing. Phase 2: besseres Timing, nicht Dosis senken.",
  },
};

export const NO_SHOW_REASON_LIST = Object.values(NO_SHOW_REASONS);
