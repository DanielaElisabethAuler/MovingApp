import type { Modality, Situation } from "@/lib/domain/types";

// ============================================================================
// OFFENER PUNKT aus Spec Abschnitt 9: "exakte Situation->Plan-Regeln".
// In diesem Gespraech entschieden: Defaults direkt aus Spec ABSCHNITT 4,
// hier als EDITIERBARE/LERNBARE Config-Tabelle — NICHT hartcodiert in der Logik.
// Phase 2 darf base_dose_min / pre_score durch gelernte Werte ersetzen.
// Zahlen sind bewusst Tuning-Defaults; jederzeit ueberschreibbar.
// ============================================================================

export interface SituationConfig {
  situation: Situation;
  label: string; // UI-Text (Kategorie, auch im Verlauf)
  tile: string; // kurzes Wort fuer die Kachel (Vorderseite, kein Erklaertext)
  feeling: string; // Ich-Botschaft fuer die Vermutung ("klingt wie ein Freund")
  icon: string; // Emoji-Icon fuer die Kachel
  hint: string; // Erklaerung — erscheint ERST nach der Wahl, nicht davor
  // Welche Modalitaeten hier erlaubt sind. Leer => nutze User-Modalitaeten/Rotation.
  // Bei wenig_energie bewusst eingeschraenkt (kein joggen/heben).
  allowedModalities: Modality[] | "user";
  // Falls true: bei "im Loch" Lieblingsworkout + Musik bevorzugen.
  preferFavorite: boolean;
  // Basisdosis ueber dem Boden (Minuten), bevor Stil-Bias/Lernen draufkommt.
  base_dose_min: number;
  // Wie aggressiv die Decke offen steht. Nur "gut" laesst Ambition voll leben.
  ceilingOpen: boolean;
  // Leistungsframe (Ziel-Fortschritt) erlaubt? Bei "im Loch" bewusst aus.
  allow_performance_frame: boolean;
  // Timing-Strategie. "calendar_slot" => freien Slot suchen (keine_zeit).
  timing: "preferred" | "calendar_slot" | "around_priority" | "flexible";
  // Option, die Dosis ueber den Tag zu fragmentieren (z.B. 4x15 bei keine_zeit).
  fragmentOption?: number[];
  // Eingangs-Befinden (0..1) fuer den Delta-Reward. Spaeter aus Schlaf/Kalender.
  pre_score: number;
}

export const SITUATION_CONFIG: Record<Situation, SituationConfig> = {
  // Guter Tag: voller Vorschlag, Decke offen, Ambition darf leben.
  gut: {
    situation: "gut",
    label: "Guter Tag",
    tile: "Gut drauf",
    feeling: "Heute ist gut was drin.",
    icon: "☀️",
    hint: "Voller Vorschlag, Decke offen.",
    allowedModalities: "user",
    preferFavorite: false,
    base_dose_min: 30,
    ceilingOpen: true,
    allow_performance_frame: true,
    timing: "preferred",
    pre_score: 0.65,
  },

  // Wenig Energie (schlecht geschlafen / krank): sanfte Bewegung, KEIN joggen/heben.
  wenig_energie: {
    situation: "wenig_energie",
    label: "Wenig Energie",
    tile: "Wenig Energie",
    feeling: "Heute ist nicht viel drin.",
    icon: "🌙",
    hint: "Schlecht geschlafen oder krank — sanft bleiben.",
    allowedModalities: ["yoga", "dehnen", "spazieren"],
    preferFavorite: false,
    base_dose_min: 10,
    ceilingOpen: false,
    allow_performance_frame: false,
    timing: "flexible",
    pre_score: 0.3,
  },

  // Keine Zeit: an Kalender anpassen, in freie Minute legen, ggf. 4x15 verteilen.
  keine_zeit: {
    situation: "keine_zeit",
    label: "Keine Zeit",
    tile: "Wenig Zeit",
    feeling: "Heute ist wenig Zeit.",
    icon: "⏳",
    hint: "Voller Tag — in eine freie Minute legen.",
    allowedModalities: "user",
    preferFavorite: false,
    base_dose_min: 15,
    ceilingOpen: false,
    allow_performance_frame: false,
    timing: "calendar_slot",
    fragmentOption: [15, 15, 15, 15],
    pre_score: 0.5,
  },

  // Anderes wichtiger: Bewegung IN die Prioritaet fusionieren (Denk-Spaziergang,
  // Walking Call). Sport konkurriert nicht, er traegt die Arbeit.
  anderes_wichtiger: {
    situation: "anderes_wichtiger",
    label: "Anderes wichtiger",
    tile: "Kopf woanders",
    feeling: "Heute zählt was anderes.",
    icon: "🎯",
    hint: "Bewegung in die Prioritaet legen — Denk-Spaziergang, Walking Call.",
    allowedModalities: ["spazieren"],
    preferFavorite: false,
    base_dose_min: 30,
    ceilingOpen: false,
    allow_performance_frame: false,
    timing: "around_priority",
    pre_score: 0.5,
  },

  // Im Loch: Musik + Lieblingsworkout, niedrigste Schwelle, KEIN Leistungsframe.
  im_loch: {
    situation: "im_loch",
    label: "Im Loch",
    tile: "Im Loch",
    feeling: "Heute fehlt der Antrieb.",
    icon: "🌧️",
    hint: "Kein Antrieb — Musik an, Lieblingsworkout, niedrigste Schwelle.",
    allowedModalities: "user",
    preferFavorite: true,
    base_dose_min: 10,
    ceilingOpen: false,
    allow_performance_frame: false,
    timing: "flexible",
    pre_score: 0.15,
  },
};
