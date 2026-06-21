import { SITUATION_CONFIG } from "@/config/situations";
import { STYLE_BIAS } from "@/config/styleBias";
import type {
  LearningState,
  Modality,
  ProposedPlan,
  Situation,
  Style,
} from "./types";

// ============================================================================
// Plan-Vorschlag = Boden  PLUS  eine titrierte Dosis darueber (Spec 7.2).
//
//  - Der Boden (floorOffer) ist unkaputtbar: die Dosis ist NIE kleiner als der
//    Boden ("nie unter den Boden", Spec 7.4).
//  - Die Dosis ueber dem Boden kommt aus der gelernten Ober-Kante (titration)
//    und wird vom STIL gebiast (nur die Schrittgroesse, nie der Boden, nie das
//    Tempo). (Spec 2.1)
//  - Modalitaet/Timing kommen aus der Situations-Config (Abschnitt 4).
// ============================================================================

export interface PlanContext {
  situation: Situation;
  style: Style;
  floorOffer: number; // das vom User angegebene Kleinstmoegliche (Minuten)
  learning: LearningState; // Ober-Kanten-Schaetzung fuer diese Situation
  userModalities: Modality[]; // aus dem Profil (Rotation)
  rotationModality: Modality; // aktuelle Rotations-Modalitaet
  favoriteWorkout?: string;
  // Kalender (bei keine_zeit): konkreter freier Slot als Text, optional.
  calendarSlot?: string;
}

export interface PlanProposal extends ProposedPlan {
  ceilingOpen: boolean; // Decke offen? (nur "gut")
  allow_performance_frame: boolean; // Leistungsframe zeigen?
  preferFavorite: boolean; // Lieblingsworkout + Musik anbieten (im Loch)?
  emphasizeCeiling: boolean; // Framing aus Stil-Bias (ambitioniert)
  rationale: string; // kurze Begruendung fuers Lern-Log / UI-Transparenz
}

function pickModality(ctx: PlanContext, cfg = SITUATION_CONFIG[ctx.situation]): Modality {
  // Im Loch: Lieblingsworkout bevorzugen (niedrigste Schwelle, Spec 4).
  if (cfg.preferFavorite && ctx.favoriteWorkout) return ctx.favoriteWorkout;

  // Eingeschraenkte Situation (z.B. wenig_energie: kein joggen/heben):
  // Rotation nur innerhalb der erlaubten Modalitaeten.
  if (cfg.allowedModalities !== "user") {
    const allowed = cfg.allowedModalities;
    if (allowed.includes(ctx.rotationModality)) return ctx.rotationModality;
    return allowed[0];
  }

  // Sonst: normale Rotation aus den User-Modalitaeten.
  return ctx.rotationModality || ctx.userModalities[0] || "bewegung";
}

function timingText(ctx: PlanContext): string {
  const cfg = SITUATION_CONFIG[ctx.situation];
  switch (cfg.timing) {
    case "calendar_slot":
      return ctx.calendarSlot ?? "in die naechste freie Minute";
    case "around_priority":
      return "rund um deine Prioritaet (Denk-Spaziergang / Walking Call)";
    case "preferred":
      return "zur bevorzugten Zeit";
    case "flexible":
    default:
      return "flexibel, wann es passt";
  }
}

export function proposePlan(ctx: PlanContext): PlanProposal {
  const cfg = SITUATION_CONFIG[ctx.situation];
  const bias = STYLE_BIAS[ctx.style];

  // Schritt ueber dem Boden: gelernte Ober-Kante, vom Stil skaliert.
  // Nur die Schrittgroesse wird gebiast — nicht der Boden, nicht das Tempo.
  const stepAboveFloor = Math.round(ctx.learning.upper_edge_min * bias.stepMultiplier);

  // Dosis = Boden + Schritt, aber NIE unter dem Boden (unkaputtbarer Boden).
  const dose = Math.max(ctx.floorOffer, ctx.floorOffer + stepAboveFloor);
  const is_floor_only = dose <= ctx.floorOffer;

  // Fragmente (4x15) nur anbieten, wenn die Situation es vorsieht und die Dosis
  // gross genug ist, um sie sinnvoll zu verteilen.
  const fragments =
    cfg.fragmentOption && dose >= 30 ? cfg.fragmentOption : undefined;

  const modality = pickModality(ctx, cfg);

  return {
    modality,
    dose_min: dose,
    timing: timingText(ctx),
    fragments,
    is_floor_only,
    ceilingOpen: cfg.ceilingOpen,
    allow_performance_frame: cfg.allow_performance_frame,
    preferFavorite: cfg.preferFavorite,
    emphasizeCeiling: bias.emphasizeCeiling && cfg.ceilingOpen,
    rationale: is_floor_only
      ? "Heute zaehlt nur, dass du auftauchst — Boden gesichert."
      : `Boden (${ctx.floorOffer} Min) plus ${dose - ctx.floorOffer} Min titriert.`,
  };
}
