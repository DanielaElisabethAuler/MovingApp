import { describe, expect, it } from "vitest";
import { computeStreak, missIsForgiven, type DayResult } from "./streak";

const done: DayResult = { outcome: "done" };
const miss: DayResult = { outcome: "no_show" };
const chaos: DayResult = { outcome: "no_show", chaos: true };

describe("computeStreak — never miss twice (Spec 3.5)", () => {
  it("ein einzelner Miss bricht den Streak NICHT", () => {
    expect(computeStreak([done, done, miss, done]).current).toBe(3);
  });

  it("zwei Misses in Folge brechen den Streak", () => {
    expect(computeStreak([done, done, miss, miss, done]).current).toBe(1);
  });

  it("Chaos-Tag ist neutral (kein Bruch, kein Fortschritt)", () => {
    // done, miss(verziehen), chaos(neutral), done -> Streak haelt
    expect(computeStreak([done, miss, chaos, done]).current).toBe(2);
  });

  it("longest wird mitgefuehrt", () => {
    expect(computeStreak([done, done, done, miss, miss, done]).longest).toBe(3);
  });
});

describe("missIsForgiven", () => {
  it("erster Miss ueberhaupt -> verziehen", () => {
    expect(missIsForgiven([], false)).toBe(true);
    expect(missIsForgiven([done, done], false)).toBe(true);
  });

  it("zweiter Miss in Folge -> NICHT verziehen", () => {
    expect(missIsForgiven([done, miss], false)).toBe(false);
  });

  it("Chaos-Tag wird beim Rueckblick uebersprungen", () => {
    // letzter realer Tag war 'done' -> dieser Miss ist verziehen
    expect(missIsForgiven([done, chaos], false)).toBe(true);
    // letzter realer Tag war Miss -> nicht verziehen, Chaos dazwischen aendert nichts
    expect(missIsForgiven([miss, chaos], false)).toBe(false);
  });

  it("heutiger Chaos-Tag ist immer verziehen", () => {
    expect(missIsForgiven([miss], true)).toBe(true);
  });
});
