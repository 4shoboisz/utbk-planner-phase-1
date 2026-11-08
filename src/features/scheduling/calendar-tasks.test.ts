import { describe, expect, it } from "vitest";
import { studyTasksByDay } from "./calendar-tasks";
import { FUNDAMENTAL_CURRICULUM } from "../curriculum/curriculum-data";
import type { StudyTask } from "../curriculum/curriculum-types";

const fresh = (): StudyTask[] => FUNDAMENTAL_CURRICULUM.map((t) => ({ ...t, originalDate: "2026-11-09", status: "pending", locked: false }));

describe("calendar study tasks", () => {
  it("shows only available tasks, once per day, and carries overdue ones to today", () => {
    const map = studyTasksByDay(fresh(), "2026-11-11");
    expect(map.get("2026-11-09")?.map((i) => i.label)).toEqual(["PK", "PU", "LBI", "LBE"]);
    expect(map.get("2026-11-11")?.every((i) => i.overdue)).toBe(true);
    expect(map.get("2026-11-11")).toHaveLength(4);
  });
  it("puts completed tasks on their real completion day (Asia/Jakarta)", () => {
    const tasks = fresh().map((t) => (t.id === "math-integer" ? { ...t, status: "completed" as const, completedAt: "2026-11-11T17:30:00.000Z" } : t));
    const done = studyTasksByDay(tasks, "2026-11-12").get("2026-11-12")?.find((i) => i.id === "math-integer");
    expect(done?.done).toBe(true);
  });
});
