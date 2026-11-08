import { addDays, diffDays, fromKey } from "@/lib/dates";
import type { CalEvent } from "@/lib/types";
import type { StudyTask } from "../curriculum/curriculum-types";
import { subtestIdsFromLabel } from "./subtest-queues";

export function getFirstIncomplete(tasks: StudyTask[]): StudyTask | undefined {
  return [...tasks].sort((a, b) => a.order - b.order).find((task) => task.status !== "completed");
}

export function getOverdueTasks(tasks: StudyTask[], today: string): StudyTask[] {
  return [...tasks]
    .filter((task) => task.status === "pending" && task.originalDate < today)
    .sort((a, b) => a.order - b.order);
}

export function getNextUnlockedTask(tasks: StudyTask[]): StudyTask | undefined {
  return getFirstIncomplete(withLockedState(tasks));
}

/** Queues a task belongs to; falls back to its subtest label so older saved data still works. */
export function queueIdsOf(task: StudyTask): string[] {
  const ids = task.subtestIds?.length ? task.subtestIds : subtestIdsFromLabel(task.subtest);
  return ids.length ? ids : ["default"];
}

/**
 * Each subtest queue is sequential on its own: a task is locked only while an earlier task
 * in one of ITS queues is unfinished. Other queues are never blocked, and nothing is skipped.
 */
export function withLockedState(tasks: StudyTask[]): StudyTask[] {
  const blocked = new Set<string>();
  return [...tasks].sort((a, b) => a.order - b.order).map((task) => {
    const queues = queueIdsOf(task);
    const locked = queues.some((queue) => blocked.has(queue));
    if (task.status !== "completed") queues.forEach((queue) => blocked.add(queue));
    return { ...task, locked };
  });
}

/** Every pending task the student may start now (at most one open task per queue sequence). */
export function getAvailableTasks(tasks: StudyTask[]): StudyTask[] {
  return withLockedState(tasks).filter((task) => task.status === "pending" && !task.locked);
}

export function getOverdueCount(task: StudyTask, today: string): number {
  return task.status === "completed" ? 0 : Math.max(0, diffDays(task.originalDate, today));
}

export const DEFAULT_AVAILABILITY: Record<number, { start: number; targetMinutes: number }> = {
  1: { start: 1110, targetMinutes: 150 }, 2: { start: 1020, targetMinutes: 150 },
  3: { start: 1110, targetMinutes: 150 }, 4: { start: 1020, targetMinutes: 150 },
  5: { start: 1110, targetMinutes: 150 }, 6: { start: 540, targetMinutes: 150 },
  0: { start: 540, targetMinutes: 150 },
};

export function isDateUnavailable(date: string, fixedEvents: CalEvent[], blockedDates: string[] = []): boolean {
  return blockedDates.includes(date) || fixedEvents.some((event) => event.date === date && event.allDay);
}

export function hasEventConflict(events: CalEvent[], date: string, start: number, end: number): boolean {
  return events.some((event) => event.date === date && !event.allDay && start < event.end && end > event.start);
}

export function getAvailableStart(date: string, events: CalEvent[]): number {
  const availability = DEFAULT_AVAILABILITY[fromKey(date).getDay()] ?? { start: 1020, targetMinutes: 150 };
  let start = availability.start;
  for (const event of events.filter((item) => item.date === date && !item.allDay).sort((a, b) => a.start - b.start)) {
    if (start < event.end && start + availability.targetMinutes > event.start) start = event.end;
  }
  return Math.min(start, 1440 - availability.targetMinutes);
}

export function suggestDates(tasks: StudyTask[], startDate: string, blockedDates: string[] = []): StudyTask[] {
  let scheduled = startDate;
  return [...tasks].sort((a, b) => a.order - b.order).map((task) => {
    if (task.status === "completed") return task;
    while (blockedDates.includes(scheduled)) scheduled = addDays(scheduled, 1);
    const result = { ...task, originalDate: scheduled };
    scheduled = addDays(scheduled, 1);
    return result;
  });
}
