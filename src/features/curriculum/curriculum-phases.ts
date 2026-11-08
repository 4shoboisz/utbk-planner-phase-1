/**
 * Learning-journey structure: 4 phases, each split into difficulty levels.
 *
 * This is presentation metadata only. Tasks keep their permanent ids/order in
 * FUNDAMENTAL_CURRICULUM; a task belongs to a level when its `subtest` equals
 * `"<phase subtests> — <level key>"`. Nothing here creates, removes, reorders
 * or unlocks tasks, so the sequential queue is untouched.
 */
import type { StudyTask } from "./curriculum-types";
import { getFirstIncomplete } from "../scheduling/scheduler";

export type PhaseAccent = "emerald" | "mint" | "lime" | "coral";

export type LevelDef = {
  /** Difficulty label as supplied, e.g. "Easy", "Beginner". */
  label: string;
  /** Roman numeral used by the Bahasa Indonesia levels. */
  numeral?: string;
  /** Sub-heading of the level, e.g. "Ejaan dan Tanda Baca (EYD V)". */
  topic?: string;
};

export type PhaseDef = {
  id: string;
  number: number;
  title: string;
  subtests: string;
  accent: PhaseAccent;
  levels: LevelDef[];
};

export const CURRICULUM_PHASES: PhaseDef[] = [
  {
    id: "phase-1-matematika",
    number: 1,
    title: "Fundamental Matematika",
    subtests: "PK / PM",
    accent: "emerald",
    levels: [{ label: "Easy" }, { label: "Medium" }, { label: "Advanced" }, { label: "Expert" }, { label: "Fatal" }],
  },
  {
    id: "phase-2-logika",
    number: 2,
    title: "Fundamental Logika",
    subtests: "PU / PUK",
    accent: "mint",
    levels: [{ label: "Easy" }, { label: "Medium" }, { label: "Expert" }],
  },
  {
    id: "phase-3-bahasa-indonesia",
    number: 3,
    title: "Fundamental Bahasa Indonesia",
    subtests: "LBI / PPU / PBM",
    accent: "lime",
    levels: [
      { numeral: "I", label: "Beginner", topic: "Ejaan dan Tanda Baca (EYD V)" },
      { numeral: "II", label: "Intermediate", topic: "Struktur Kalimat" },
      { numeral: "III", label: "Advanced", topic: "Makna Bacaan" },
      { numeral: "IV", label: "Expert", topic: "Pemahaman Informasi" },
    ],
  },
  {
    id: "phase-4-bahasa-inggris",
    number: 4,
    title: "Fundamental Bahasa Inggris",
    subtests: "LBE",
    accent: "coral",
    levels: [{ label: "Easy" }, { label: "Basic" }, { label: "Intermediate" }, { label: "Advanced" }],
  },
];

/** Level part of a task's `subtest` string, e.g. "Beginner — Ejaan dan Tanda Baca (EYD V)". */
export const levelKey = (level: LevelDef) => (level.topic ? `${level.label} — ${level.topic}` : level.label);
export const subtestFor = (phase: PhaseDef, level: LevelDef) => `${phase.subtests} — ${levelKey(level)}`;

export type LevelGroup = {
  def: LevelDef;
  tasks: StudyTask[];
  total: number;
  completed: number;
  /** Real completion percentage of this level (0 when nothing is completed). */
  percent: number;
};

export type PhaseGroup = {
  def: PhaseDef;
  levels: LevelGroup[];
  total: number;
  completed: number;
  percent: number;
  /** True when the first incomplete task of the whole queue is in this phase. */
  hasActiveTask: boolean;
};

export type CurriculumJourney = {
  phases: PhaseGroup[];
  /** Tasks that match no level. Should stay empty; shown rather than hidden if not. */
  unassigned: StudyTask[];
  total: number;
  completed: number;
  percent: number;
};

const pct = (done: number, total: number) => (total === 0 ? 0 : Math.round((done / total) * 100));

/** Groups live store tasks into phases → levels. Counts and percentages come only from task status. */
export function groupCurriculum(tasks: StudyTask[]): CurriculumJourney {
  const ordered = [...tasks].sort((a, b) => a.order - b.order);
  const activeId = getFirstIncomplete(ordered)?.id;
  const placed = new Set<string>();

  const phases = CURRICULUM_PHASES.map((def): PhaseGroup => {
    const levels = def.levels.map((levelDef): LevelGroup => {
      const subtest = subtestFor(def, levelDef);
      const inLevel = ordered.filter((t) => t.subtest === subtest);
      inLevel.forEach((t) => placed.add(t.id));
      const completed = inLevel.filter((t) => t.status === "completed").length;
      return { def: levelDef, tasks: inLevel, total: inLevel.length, completed, percent: pct(completed, inLevel.length) };
    });
    const total = levels.reduce((n, l) => n + l.total, 0);
    const completed = levels.reduce((n, l) => n + l.completed, 0);
    return {
      def,
      levels,
      total,
      completed,
      percent: pct(completed, total),
      hasActiveTask: levels.some((l) => l.tasks.some((t) => t.id === activeId)),
    };
  });

  const completed = ordered.filter((t) => t.status === "completed").length;
  return {
    phases,
    unassigned: ordered.filter((t) => !placed.has(t.id)),
    total: ordered.length,
    completed,
    percent: pct(completed, ordered.length),
  };
}

/** "Vocabulary (A, B)" → { name: "Vocabulary", detail: "A, B" }. Other titles are returned whole. */
export function splitTopicTitle(title: string): { name: string; detail?: string } {
  const m = title.match(/^(.+?)\s*\((.+)\)$/);
  return m ? { name: m[1], detail: m[2] } : { name: title };
}

/** Calendar day (YYYY-MM-DD) of an ISO timestamp in the study timezone, Asia/Jakarta. */
export function completionDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}
