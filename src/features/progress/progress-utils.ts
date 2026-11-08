import type { StudyTask } from "../curriculum/curriculum-types";
export function completionPercent(tasks: StudyTask[]): number { return tasks.length ? Math.round(tasks.filter((task) => task.status === "completed").length / tasks.length * 100) : 0; }
