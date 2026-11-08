import { describe, expect, it } from "vitest";
import { FUNDAMENTAL_CURRICULUM } from "./curriculum-data";
import type { StudyTask } from "./curriculum-types";
import {
  CURRICULUM_PHASES,
  completionDateKey,
  groupCurriculum,
  splitTopicTitle,
  subtestFor,
} from "./curriculum-phases";

/**
 * Literal transcription of the supplied "Learning Phases" list. This is the
 * source of truth: phase order, level order, topic names and topic order.
 *
 * Note on Phase 3 level IV: the list shows one bullet, "Kesimpulan, Ringkasan,
 * Rangkuman, & Ikhtisar". The permanent data keeps those as four separate
 * topics (Kesimpulan / Ringkasan / Rangkuman / Ikhtisar), so the bullet is
 * expanded here. Same words, same order.
 */
const SPEC: { subtests: string; levels: [string, string[]][] }[] = [
  {
    subtests: "PK / PM",
    levels: [
      ["Easy", ["Operasi Bilangan Bulat", "Operasi Bilangan Pecahan"]],
      ["Medium", ["Eksponen Dasar", "Operasi Dasar Aljabar", "Pemfaktoran Aljabar"]],
      ["Advanced", ["Persamaan Linear", "SPLDV", "Mengubah Subjek Pada Rumus", "Pertidaksamaan Linear"]],
      ["Expert", ["Persamaan Kuadrat", "Fungsi", "Bangun Datar"]],
      ["Fatal", ["Bangun Ruang", "Turunan Fungsi"]],
    ],
  },
  {
    subtests: "PU / PUK",
    levels: [
      ["Easy", ["Pernyataan Sebab-Akibat", "Kesesuaian Informasi di Dalam Teks", "Ponens", "Tollens"]],
      ["Medium", ["Negasi", "Silogisme", "Pernyataan Benar/Salah", "Memperkuat", "Perbandingan Teks"]],
      ["Expert", ["Memperlemah", "Kualitas Simpulan", "Pola Bilangan", "Logika Kuantor"]],
    ],
  },
  {
    subtests: "LBI / PPU / PBM",
    levels: [
      ["Beginner — Ejaan dan Tanda Baca (EYD V)", ["Pengenalan Dasar Bahasa Indonesia", "Penggunaan Huruf", "Penggunaan Tanda Baca", "Penulisan Kata", "Jenis Kata", "Penulisan Unsur Kata"]],
      ["Intermediate — Struktur Kalimat", ["Frasa, Klausa, dan Kalimat", "Jenis Kalimat", "Pola Penyusunan Kalimat", "Inti Kalimat"]],
      ["Advanced — Makna Bacaan", ["Makna Kata", "Semantik & Majas", "Teks Bacaan", "Tema, Topik, & Judul"]],
      ["Expert — Pemahaman Informasi", ["Pemahaman Informasi Dalam Teks Bacaan", "Gagasan Pokok", "Paragraf Rumpang dan Acak", "Kesimpulan", "Ringkasan", "Rangkuman", "Ikhtisar"]],
    ],
  },
  {
    subtests: "LBE",
    levels: [
      ["Easy", ["Vocabulary (Active & Passive Vocabulary, Level-based Vocabulary)", "Basic Reading (Agreement, Verb/Sentence, Subject, Predicate/Object)"]],
      ["Basic", ["Author Related Questions", "Authors Tone & Purpose", "Finding Detailed Information", "Equal Meaning", "Skimming & Scanning"]],
      ["Intermediate", ["Main Idea", "Prediction", "Summary/Inference", "Stated & Implied Idea", "Restating Sentence", "True or False Question"]],
      ["Advanced", ["Tenses", "Grammar"]],
    ],
  },
];

const asTasks = (done: number[] = []): StudyTask[] =>
  FUNDAMENTAL_CURRICULUM.map((t) => ({
    ...t,
    originalDate: "2026-11-09",
    status: done.includes(t.order) ? "completed" : "pending",
    locked: false,
    ...(done.includes(t.order) ? { completedAt: "2026-11-10T17:30:00.000Z" } : {}),
  }));

describe("learning phases match the supplied curriculum", () => {
  it("has the four phases in order, with the supplied subtests", () => {
    expect(CURRICULUM_PHASES.map((p) => p.subtests)).toEqual(SPEC.map((p) => p.subtests));
    expect(CURRICULUM_PHASES.map((p) => p.number)).toEqual([1, 2, 3, 4]);
    expect(CURRICULUM_PHASES.map((p) => p.title)).toEqual([
      "Fundamental Matematika",
      "Fundamental Logika",
      "Fundamental Bahasa Indonesia",
      "Fundamental Bahasa Inggris",
    ]);
  });

  it("keeps every topic name, order, level and subject mapping exactly", () => {
    const journey = groupCurriculum(asTasks());
    expect(journey.phases).toHaveLength(4);
    journey.phases.forEach((phase, pi) => {
      const want = SPEC[pi];
      expect(phase.levels.map((l) => l.def.topic ? `${l.def.label} — ${l.def.topic}` : l.def.label)).toEqual(want.levels.map(([k]) => k));
      phase.levels.forEach((level, li) => {
        expect(level.tasks.map((t) => t.title)).toEqual(want.levels[li][1]);
        // Subject mapping is carried by each task's own subtest string.
        level.tasks.forEach((t) => expect(t.subtest).toBe(subtestFor(phase.def, level.def)));
      });
    });
  });

  it("places every task exactly once and in the original queue order", () => {
    const journey = groupCurriculum(asTasks());
    expect(journey.unassigned).toEqual([]);
    const flat = journey.phases.flatMap((p) => p.levels.flatMap((l) => l.tasks));
    expect(flat.map((t) => t.id)).toEqual(FUNDAMENTAL_CURRICULUM.map((t) => t.id));
    expect(flat.map((t) => t.order)).toEqual(flat.map((_, i) => i + 1));
    expect(journey.phases.map((p) => p.total)).toEqual([14, 13, 21, 15]);
    expect(journey.total).toBe(FUNDAMENTAL_CURRICULUM.length);
  });
});

describe("progress comes from real data", () => {
  it("is 0% everywhere when nothing is completed", () => {
    const j = groupCurriculum(asTasks());
    expect(j.completed).toBe(0);
    expect(j.percent).toBe(0);
    j.phases.forEach((p) => {
      expect(p.percent).toBe(0);
      p.levels.forEach((l) => expect(l.percent).toBe(0));
    });
  });

  it("counts completed tasks per level and phase", () => {
    const j = groupCurriculum(asTasks([1, 2, 3])); // Math Easy (2) + Math Medium first topic
    expect(j.phases[0].completed).toBe(3);
    expect(j.phases[0].levels[0]).toMatchObject({ total: 2, completed: 2, percent: 100 });
    expect(j.phases[0].levels[1]).toMatchObject({ total: 3, completed: 1, percent: 33 });
    expect(j.phases[1].completed).toBe(0);
    expect(j.completed).toBe(3);
    expect(j.percent).toBe(Math.round((3 / FUNDAMENTAL_CURRICULUM.length) * 100));
  });

  it("marks the phase that holds the first incomplete task as active", () => {
    expect(groupCurriculum(asTasks()).phases.map((p) => p.hasActiveTask)).toEqual([true, false, false, false]);
    expect(groupCurriculum(asTasks([...Array(14).keys()].map((i) => i + 1))).phases.map((p) => p.hasActiveTask)).toEqual([false, true, false, false]);
  });
});

describe("helpers", () => {
  it("splits a parenthesised detail from the topic name, leaving other titles whole", () => {
    expect(splitTopicTitle("Vocabulary (Active & Passive Vocabulary, Level-based Vocabulary)")).toEqual({
      name: "Vocabulary",
      detail: "Active & Passive Vocabulary, Level-based Vocabulary",
    });
    expect(splitTopicTitle("Tema, Topik, & Judul")).toEqual({ name: "Tema, Topik, & Judul" });
  });

  it("records the completion day in Asia/Jakarta, not UTC", () => {
    expect(completionDateKey("2026-11-10T17:30:00.000Z")).toBe("2026-11-11"); // 00:30 WIB next day
    expect(completionDateKey("2026-11-10T10:00:00.000Z")).toBe("2026-11-10");
  });
});
