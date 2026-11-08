import { describe, expect, it } from "vitest";
import { CURRICULUM_START_DATE, FUNDAMENTAL_CURRICULUM } from "./curriculum-data";

describe("permanent Fundamental curriculum", () => {
  it("contains the complete user-provided curriculum without duplicate IDs", () => {
    const ids = FUNDAMENTAL_CURRICULUM.map((task) => task.id);
    expect(ids.length).toBeGreaterThan(60);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("preserves sequential permanent order", () => {
    expect(FUNDAMENTAL_CURRICULUM[0].order).toBe(1);
    expect(FUNDAMENTAL_CURRICULUM.at(-1)?.order).toBe(FUNDAMENTAL_CURRICULUM.length);
    expect(CURRICULUM_START_DATE).toBe("2026-11-09");
  });
});
