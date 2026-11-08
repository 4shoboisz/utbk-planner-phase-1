"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";
import { CURRICULUM_START_DATE, FUNDAMENTAL_CURRICULUM } from "@/features/curriculum/curriculum-data";
import type { PersonalAvailability, StudyReflection, StudySession, StudyTask, Understanding } from "@/features/curriculum/curriculum-types";
import { getFirstIncomplete, withLockedState } from "@/features/scheduling/scheduler";
import { validateReflection } from "@/features/verification/reflection-validation";
import { addDays, diffDays } from "@/lib/dates";
import { sessionMinutes } from "@/features/study/study-time";

const DEFAULT_AVAILABILITY: Record<number, PersonalAvailability> = {
  1: { startMinutes: 1110, flexible: false },
  2: { startMinutes: 1020, flexible: false },
  3: { startMinutes: 1110, flexible: false },
  4: { startMinutes: 1020, flexible: false },
  5: { startMinutes: 1110, flexible: false },
  6: { startMinutes: 1020, flexible: true },
  0: { startMinutes: 1020, flexible: true },
};

type StudyState = {
  version: number;
  projectStartDate: string;
  targetMinutes: number;
  availability: Record<number, PersonalAvailability>;
  blockedDates: string[];
  planningEndDate: string;
  tasks: StudyTask[];
  reflections: StudyReflection[];
  sessions: StudySession[];
};

type StudyActions = {
  completeTask: (taskId: string, text: string, understanding: Understanding) => boolean;
  logSession: (input: Omit<StudySession, "id" | "minutes">) => boolean;
  setProjectStartDate: (date: string) => void;
  setTargetMinutes: (minutes: number) => void;
  setAvailability: (day: number, availability: PersonalAvailability) => void;
  setBlockedDates: (dates: string[]) => void;
  setPlanningEndDate: (date: string) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetStudyData: () => void;
};

const initialTasks: StudyTask[] = FUNDAMENTAL_CURRICULUM.map((task) => ({
  ...task,
  originalDate: CURRICULUM_START_DATE,
  status: "pending",
  locked: task.order !== 1,
}));

export const useStudyStore = create<StudyState & StudyActions>()(
  persist(
    (set, get) => ({
      version: 1,
      projectStartDate: CURRICULUM_START_DATE,
      targetMinutes: 150,
      availability: DEFAULT_AVAILABILITY,
      blockedDates: ["2026-11-13", "2026-11-14", "2026-11-15"],
      planningEndDate: "2026-11-22",
      tasks: initialTasks,
      reflections: [],
      sessions: [],
      logSession: (input) => {
        const minutes = sessionMinutes(input.start, input.end);
        if (!input.date || minutes === null) { toast.error("Waktu tidak valid", { description: "Jam selesai harus setelah jam mulai." }); return false; }
        set((state) => ({ sessions: [...state.sessions, { ...input, id: crypto.randomUUID(), minutes }] }));
        toast.success("Waktu belajar tercatat", { description: `${minutes} menit` });
        return true;
      },
      completeTask: (taskId, text, understanding) => {
        const error = validateReflection(text);
        if (error) { toast.error("Belum bisa diselesaikan", { description: error }); return false; }
        const task = get().tasks.find((item) => item.id === taskId);
        if (!task || task.status === "completed" || task.locked) { toast.error("Materi belum dapat diselesaikan"); return false; }
        const now = new Date().toISOString();
        const reflection: StudyReflection = { id: crypto.randomUUID(), taskId, submittedAt: now, text: text.trim(), understanding };
        const tasks = withLockedState(get().tasks.map((item) => item.id === taskId
          ? { ...item, status: "completed" as const, completedAt: now, mastery: understanding }
          : item));
        set((state) => ({ tasks, reflections: [...state.reflections, reflection] }));
        toast.success("Materi selesai", { description: "Materi berikutnya sudah terbuka." });
        return true;
      },
      setProjectStartDate: (date) => set((state) => {
        const offset = diffDays(state.projectStartDate, date);
        return {
          projectStartDate: date,
          tasks: state.tasks.map((task) => task.status === "completed"
            ? task
            : { ...task, originalDate: addDays(task.originalDate, offset) }),
        };
      }),
      setTargetMinutes: (minutes) => set({ targetMinutes: Math.max(15, minutes) }),
      setAvailability: (day, availability) => set((state) => {
        const avl = { ...state.availability };
        avl[day] = availability;
        return { availability: avl };
      }),
      setBlockedDates: (dates) => set({ blockedDates: [...new Set(dates)].sort() }),
      setPlanningEndDate: (date) => set({ planningEndDate: date }),
      exportData: () => JSON.stringify({ version: 2, projectStartDate: get().projectStartDate, planningEndDate: get().planningEndDate, blockedDates: get().blockedDates, targetMinutes: get().targetMinutes, availability: get().availability, tasks: get().tasks, reflections: get().reflections, sessions: get().sessions }, null, 2),
      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (!Array.isArray(data.tasks) || !Array.isArray(data.reflections)) throw new Error("Invalid data");
          const ids = new Set(initialTasks.map((task) => task.id));
          if (data.tasks.length !== ids.size) throw new Error("Curriculum mismatch");
          const importedIds = data.tasks.map((task: StudyTask) => task.id);
          if (new Set(importedIds).size !== ids.size || !data.tasks.every((task: StudyTask) => ids.has(task.id))) throw new Error("Curriculum mismatch");
          if (!data.reflections.every((reflection: StudyReflection) => ids.has(reflection.taskId) && typeof reflection.text === "string" && typeof reflection.submittedAt === "string")) throw new Error("Invalid reflections");
          set({ projectStartDate: data.projectStartDate, planningEndDate: data.planningEndDate ?? "2026-11-22", blockedDates: data.blockedDates ?? ["2026-11-13", "2026-11-14", "2026-11-15"], targetMinutes: data.targetMinutes, availability: data.availability ?? DEFAULT_AVAILABILITY, tasks: withLockedState(data.tasks), reflections: data.reflections, sessions: Array.isArray(data.sessions) ? data.sessions : [] });
          toast.success("Data belajar berhasil dipulihkan");
          return true;
        } catch {
          toast.error("Import gagal", { description: "Format data tidak valid atau kurikulum tidak sesuai." });
          return false;
        }
      },
      resetStudyData: () => set({
        version: 2,
        projectStartDate: CURRICULUM_START_DATE,
        planningEndDate: "2026-11-22",
        targetMinutes: 150,
        availability: DEFAULT_AVAILABILITY,
        blockedDates: ["2026-11-13", "2026-11-14", "2026-11-15"],
        tasks: initialTasks,
        reflections: [],
        sessions: [],
      }),
    }),
    {
      name: "utbk-study:state",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // On every load, re-read the permanent curriculum text (title, subtest, order, minutes)
      // from code, and keep only the student's progress (status, completion time, mastery,
      // planned date) from storage. Renaming a topic in curriculum-data.ts therefore reaches
      // existing users without touching their history.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<StudyState>;
        if (!Array.isArray(saved.tasks)) return { ...current, ...saved };
        const savedById = new Map(saved.tasks.map((task) => [task.id, task]));
        const tasks = FUNDAMENTAL_CURRICULUM.map((permanent) => {
          const prior = savedById.get(permanent.id);
          return {
            ...permanent,
            originalDate: prior?.originalDate ?? CURRICULUM_START_DATE,
            status: prior?.status ?? "pending",
            completedAt: prior?.completedAt,
            mastery: prior?.mastery,
            locked: true,
          } satisfies StudyTask;
        });
        return { ...current, ...saved, tasks: withLockedState(tasks) };
      },
      migrate: (persisted) => {
        const data = persisted as Partial<StudyState>;
        const savedById = new Map((data.tasks ?? []).map((task) => [task.id, task]));
        const tasks = FUNDAMENTAL_CURRICULUM.map((permanent) => {
          const saved = savedById.get(permanent.id);
          return {
            ...permanent,
            originalDate: saved?.originalDate ?? CURRICULUM_START_DATE,
            status: saved?.status ?? "pending",
            completedAt: saved?.completedAt,
            mastery: saved?.mastery,
            locked: true,
          } satisfies StudyTask;
        });
        return {
          ...data,
          version: 2,
          projectStartDate: data.projectStartDate ?? CURRICULUM_START_DATE,
          targetMinutes: data.targetMinutes ?? 150,
          availability: (data as Partial<StudyState>).availability ?? DEFAULT_AVAILABILITY,
          blockedDates: data.blockedDates ?? ["2026-11-13", "2026-11-14", "2026-11-15"],
          planningEndDate: data.planningEndDate ?? "2026-11-22",
          tasks: withLockedState(tasks),
          reflections: data.reflections ?? [],
          sessions: data.sessions ?? [],
        } as StudyState;
      },
    },
  ),
);

export function getActiveStudyTask() { return getFirstIncomplete(useStudyStore.getState().tasks); }
