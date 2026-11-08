import type { StudyTask } from "../curriculum/curriculum-types";
import { completionDateKey } from "../curriculum/curriculum-phases";
import { getAvailableTasks } from "./scheduler";

export type CalendarTaskItem = { id: string; label: string; title: string; done: boolean; overdue: boolean };

const toItem = (t: StudyTask, done: boolean, overdue: boolean): CalendarTaskItem => ({
  id: t.id, label: t.subtestIds?.[0] ?? t.subtest.split(" — ")[0], title: t.title, done, overdue,
});

/**
 * Study tasks per calendar day. Untimed by design (no fake times).
 * Completed tasks sit on their real completion day; available pending tasks sit on their
 * original date and, when overdue, also on today. A task never appears twice on one day.
 */
export function studyTasksByDay(tasks: StudyTask[], today: string): Map<string, CalendarTaskItem[]> {
  const map = new Map<string, CalendarTaskItem[]>();
  const add = (day: string, item: CalendarTaskItem) => {
    const list = map.get(day) ?? [];
    if (!list.some((x) => x.id === item.id)) list.push(item);
    map.set(day, list);
  };
  for (const t of tasks) if (t.status === "completed" && t.completedAt) add(completionDateKey(t.completedAt), toItem(t, true, false));
  for (const t of getAvailableTasks(tasks)) {
    const overdue = t.originalDate < today;
    add(t.originalDate, toItem(t, false, overdue));
    if (overdue) add(today, toItem(t, false, true));
  }
  return map;
}
