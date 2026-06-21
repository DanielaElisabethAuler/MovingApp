import { describe, expect, it } from "vitest";
import { computeReward, DELTA_WEIGHT, REWARD_BASE } from "./reward";

describe("computeReward — Delta statt Absolutwert (Spec 3.3)", () => {
  it("no_show liefert nur die Basisstrafe, keinen Delta-Term", () => {
    const { graded, reward } = computeReward({ outcome: "no_show", preScore: 0.3 });
    expect(graded).toBe("no_show");
    expect(reward).toBe(REWARD_BASE.no_show);
  });

  it('"im Loch -> okay" zaehlt als voller Treffer trotz mittlerem Endwert', () => {
    // pre 0.15 (im Loch), post 0.55 -> grosser Hub, aber post unter good-threshold
    const low = computeReward({ outcome: "done", preScore: 0.15, postScore: 0.55 });
    // gleicher Endwert, aber von hoch gestartet -> kleinerer/negativer Delta
    const high = computeReward({ outcome: "done", preScore: 0.65, postScore: 0.55 });

    expect(low.reward).toBeGreaterThan(high.reward);
  });

  it("done_good ab Schwelle, done_bad darunter", () => {
    expect(computeReward({ outcome: "done", preScore: 0.5, postScore: 0.9 }).graded).toBe(
      "done_good",
    );
    expect(computeReward({ outcome: "done", preScore: 0.5, postScore: 0.3 }).graded).toBe(
      "done_bad",
    );
  });

  it("reward = base + W*(post - pre)", () => {
    const r = computeReward({ outcome: "done", preScore: 0.2, postScore: 0.8 });
    expect(r.reward).toBeCloseTo(REWARD_BASE.done_good + DELTA_WEIGHT * (0.8 - 0.2));
  });
});
