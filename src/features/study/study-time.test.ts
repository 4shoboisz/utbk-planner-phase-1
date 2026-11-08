import { describe, expect, it } from "vitest";
import { sessionMinutes } from "./study-time";

describe("manual study time", () => {
  it("calculates duration from start and end", () => expect(sessionMinutes("17:00", "18:15")).toBe(75));
  it("rejects invalid or reversed ranges", () => {
    expect(sessionMinutes("18:00", "17:00")).toBeNull();
    expect(sessionMinutes("17:00", "17:00")).toBeNull();
    expect(sessionMinutes("25:00", "26:00")).toBeNull();
    expect(sessionMinutes("", "10:00")).toBeNull();
  });
});
