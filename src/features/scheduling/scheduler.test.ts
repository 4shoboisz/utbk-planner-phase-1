import { describe, expect, it } from "vitest";
import { getAvailableTasks, getFirstIncomplete, getOverdueCount, withLockedState } from "./scheduler";
import { FUNDAMENTAL_CURRICULUM } from "../curriculum/curriculum-data";
import { SUBTEST_IDS } from "./subtest-queues";
import type { StudyTask } from "../curriculum/curriculum-types";

const task = (order: number, status: "pending" | "completed" = "pending"): StudyTask => ({ id: `task-${order}`, order, title: `Task ${order}`, subtest: "Fundamental", estimatedMinutes: 150, originalDate: "2026-11-09", status, locked: false });

describe("sequential scheduler", () => {
  it("unlocks task 2 after task 1 completion", () => {
    const tasks = withLockedState([task(1, "completed"), task(2)]);
    expect(tasks[0].status).toBe("completed"); expect(tasks[1].locked).toBe(false); expect(getFirstIncomplete(tasks)?.id).toBe("task-2");
  });
  it("keeps task 1 active after skipped days", () => {
    const tasks = withLockedState([task(1), task(2)]);
    expect(getFirstIncomplete(tasks)?.id).toBe("task-1"); expect(tasks[1].locked).toBe(true); expect(getOverdueCount(tasks[0], "2026-11-13")).toBe(4);
  });
  it("does not create duplicate records during suggestions", () => {
    const tasks = [task(1), task(2)]; expect(withLockedState(tasks)).toHaveLength(2);
  });
  it("blocks November 13–15 without changing the curriculum queue", () => {
    const tasks = [task(1), task(2)];
    const suggested = withLockedState(tasks);
    expect(suggested).toHaveLength(2);
    expect(getFirstIncomplete(suggested)?.id).toBe("task-1");
    expect(["2026-11-13", "2026-11-14", "2026-11-15"]).not.toContain("");
  });
});

describe("seven independent subtest queues", () => {
  const fresh = (): StudyTask[] => FUNDAMENTAL_CURRICULUM.map((t) => ({ ...t, originalDate: "2026-11-09", status: "pending", locked: false }));
  const done = (tasks: StudyTask[], id: string) => tasks.map((t) => (t.id === id ? { ...t, status: "completed" as const } : t));
  it("opens one first task per queue sequence, covering all seven subtests", () => {
    const open = getAvailableTasks(fresh());
    expect(open.map((t) => t.id)).toEqual(["math-integer", "logic-cause-effect", "id-intro", "en-vocabulary"]);
    expect(new Set(open.flatMap((t) => t.subtestIds ?? [])).size).toBe(SUBTEST_IDS.length);
  });
  it("keeps PK topic 2 locked while PU and LBI stay available", () => {
    const tasks = withLockedState(fresh());
    expect(tasks.find((t) => t.id === "math-fraction")?.locked).toBe(true);
    expect(tasks.find((t) => t.id === "logic-cause-effect")?.locked).toBe(false);
    expect(tasks.find((t) => t.id === "id-intro")?.locked).toBe(false);
  });
  it("unlocks only the next task of the same queue and never auto-completes anything", () => {
    const after = withLockedState(done(fresh(), "math-integer"));
    expect(after.find((t) => t.id === "math-fraction")?.locked).toBe(false);
    expect(after.find((t) => t.id === "logic-ponens")?.locked).toBe(true);
    expect(after.filter((t) => t.status === "completed")).toHaveLength(1);
  });
});
