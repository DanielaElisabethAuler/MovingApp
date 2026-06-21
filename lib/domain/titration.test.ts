import { describe, expect, it } from "vitest";
import { proposePlan } from "./proposePlan";
import { DEFAULT_STEP_MIN, seedLearningState, titrate } from "./titration";
import type { LearningState } from "./types";

const base = (over: Partial<LearningState> = {}): LearningState => ({
  situation: "gut",
  upper_edge_min: 20,
  step_min: DEFAULT_STEP_MIN,
  ...over,
});

describe("titrate — Ratsche zeigt nach oben (Spec 2.3)", () => {
  it("done_good -> Schritt hoch", () => {
    const r = titrate({ state: base(), graded: "done_good" });
    expect(r.direction).toBe("up");
    expect(r.state.upper_edge_min).toBe(25);
  });

  it("done_bad -> halten", () => {
    const r = titrate({ state: base(), graded: "done_bad" });
    expect(r.direction).toBe("hold");
    expect(r.state.upper_edge_min).toBe(20);
  });

  it('no_show "war zu viel" -> Schritt runter', () => {
    const r = titrate({ state: base(), graded: "no_show", noShowReason: "war_zu_viel" });
    expect(r.direction).toBe("down");
    expect(r.state.upper_edge_min).toBe(15);
  });

  it("no_show wegen Zeit/Vergessen/Lust -> KEIN Dosis-Signal (halten)", () => {
    for (const reason of ["keine_zeit", "vergessen", "keine_lust"] as const) {
      const r = titrate({ state: base(), graded: "no_show", noShowReason: reason });
      expect(r.direction).toBe("hold");
      expect(r.state.upper_edge_min).toBe(20);
    }
  });

  it("no_show an zugepacktem Kalender-Tag -> Chaos, kein Signal (Spec 3.4)", () => {
    const r = titrate({
      state: base(),
      graded: "no_show",
      noShowReason: "war_zu_viel", // selbst dieser Grund zaehlt am Chaos-Tag nicht
      calendarPacked: true,
    });
    expect(r.direction).toBe("hold");
    expect(r.state.upper_edge_min).toBe(20);
  });

  it("Ober-Kante faellt nicht unter 0 (Boden bleibt unkaputtbar)", () => {
    const r = titrate({
      state: base({ upper_edge_min: 0 }),
      graded: "no_show",
      noShowReason: "war_zu_viel",
    });
    expect(r.state.upper_edge_min).toBe(0);
  });

  it("taegliches Minimum driftet NICHT nach unten: gut bewerteter Boden-Tag titriert hoch", () => {
    // Selbst wenn der Plan nur der Boden war, hebt ein done_good die Ober-Kante.
    const start = base({ upper_edge_min: 0 });
    const r = titrate({ state: start, graded: "done_good" });
    expect(r.state.upper_edge_min).toBeGreaterThan(0);
  });
});

describe("proposePlan — Boden ist unkaputtbar (Spec 7.4)", () => {
  it("Dosis nie unter dem Boden, auch bei kleiner Ober-Kante", () => {
    const plan = proposePlan({
      situation: "gut",
      style: "dranbleiben",
      floorOffer: 10,
      learning: seedLearningState("gut"),
      userModalities: ["joggen"],
      rotationModality: "joggen",
    });
    expect(plan.dose_min).toBeGreaterThanOrEqual(10);
  });

  it("Ober-Kante 0 -> Boden-only-Plan", () => {
    const plan = proposePlan({
      situation: "gut",
      style: "nachhaltig",
      floorOffer: 8,
      learning: { situation: "gut", upper_edge_min: 0, step_min: DEFAULT_STEP_MIN },
      userModalities: ["joggen"],
      rotationModality: "joggen",
    });
    expect(plan.dose_min).toBe(8);
    expect(plan.is_floor_only).toBe(true);
  });

  it("Stil biast nur die Dosis ueber dem Boden: ambitioniert > dranbleiben", () => {
    const common = {
      situation: "gut" as const,
      floorOffer: 10,
      learning: { situation: "gut" as const, upper_edge_min: 20, step_min: DEFAULT_STEP_MIN },
      userModalities: ["joggen"],
      rotationModality: "joggen",
    };
    const amb = proposePlan({ ...common, style: "ambitioniert" });
    const dran = proposePlan({ ...common, style: "dranbleiben" });
    expect(amb.dose_min).toBeGreaterThan(dran.dose_min);
  });

  it("wenig_energie haelt sich an sanfte Modalitaeten (kein joggen)", () => {
    const plan = proposePlan({
      situation: "wenig_energie",
      style: "ambitioniert",
      floorOffer: 5,
      learning: seedLearningState("wenig_energie"),
      userModalities: ["joggen", "kraft"],
      rotationModality: "joggen",
    });
    expect(["yoga", "dehnen", "spazieren"]).toContain(plan.modality);
  });
});
