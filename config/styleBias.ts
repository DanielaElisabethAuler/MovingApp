import type { Style } from "@/lib/domain/types";

// ============================================================================
// OFFENER PUNKT aus Spec Abschnitt 9: "Stil->Bias".
// In diesem Gespraech entschieden: "klar gestaffelt".
//
// WICHTIG (Spec 2.1 / 2.2): Der Stil BIAST nur die Dosis UEBER dem Boden.
//  - Er beruehrt den Boden NIE (floor_offer bleibt unangetastet).
//  - Er ist NICHT das Titrations-Tempo (das gehoert dem System, Spec 2.2)
//    und wird NICHT als Regler exponiert. Stil ist der "langsame Regler" des
//    Users (das Wohin/Wie grob), kein Tempo-Schalter.
// stepMultiplier skaliert die Schrittweite; emphasizeCeiling steuert nur das
// Framing (Decke betonen), nicht die Dosis selbst.
// ============================================================================

export interface StyleBiasConfig {
  style: Style;
  label: string;
  // Faktor auf die Basisdosis-Spanne UEBER dem Boden (nie auf den Boden).
  stepMultiplier: number;
  // Nur Framing: bei "gut"/ambitioniert die offene Decke betonen.
  emphasizeCeiling: boolean;
}

export const STYLE_BIAS: Record<Style, StyleBiasConfig> = {
  // Grosser Schritt ueber Boden + Decke betont.
  ambitioniert: {
    style: "ambitioniert",
    label: "Ambitioniert",
    stepMultiplier: 1.5,
    emphasizeCeiling: true,
  },
  // Moderater Schritt.
  nachhaltig: {
    style: "nachhaltig",
    label: "Nachhaltig",
    stepMultiplier: 1.0,
    emphasizeCeiling: false,
  },
  // Minimaler Nudge ueber dem Boden (Ratsche zeigt weiter nach oben, aber sanft).
  dranbleiben: {
    style: "dranbleiben",
    label: "Dranbleiben",
    stepMultiplier: 0.5,
    emphasizeCeiling: false,
  },
};
