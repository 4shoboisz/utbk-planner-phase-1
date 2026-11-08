"use client";

import { useState } from "react";
import { GradientProgress } from "@/components/progress/gradient-progress";
import { groupCurriculum } from "@/features/curriculum/curriculum-phases";
import { getFirstIncomplete } from "@/features/scheduling/scheduler";
import { useToday } from "@/hooks/use-today";
import { useStudyStore } from "@/stores/study-store";
import { PhaseSection } from "./roadmap-phase";

export function RoadmapView() {
  const tasks = useStudyStore((s) => s.tasks);
  const today = useToday();
  const journey = groupCurriculum(tasks);
  const next = getFirstIncomplete(tasks);
  // Explicit user choices only; otherwise the phase holding the active task is open.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  return (
    <main className="page-enter min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <header className="journey-bg rounded-2xl border border-hairline p-5 sm:p-6">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-fg-2 uppercase">UTBK 2027 · Fase Fundamental</p>
          <h1 className="mt-1.5 text-xl font-semibold text-fg">Fundamental roadmap</h1>
          <p className="mt-1 max-w-md text-sm text-fg-2">Urutan materi permanen dan tidak dapat dilewati.</p>
          <div className="mt-5 flex items-end justify-between gap-4">
            <p className="text-sm text-fg tabular-nums">
              <span className="text-2xl font-semibold">{journey.completed}</span> / {journey.total} materi selesai
            </p>
            <p className="text-2xl font-semibold text-fg tabular-nums">{journey.percent}%</p>
          </div>
          <GradientProgress value={journey.percent} label="Progres keseluruhan" trackClassName="bg-hover" className="mt-2.5 h-2.5" />
          <p className="mt-3 text-xs text-fg-2">
            {next ? <>Berikutnya: <span className="font-medium text-fg">{next.title}</span></> : "Semua materi Fundamental sudah selesai."}
          </p>
        </header>

        <div className="mt-5 space-y-3">
          {journey.phases.map((phase) => (
            <PhaseSection
              key={phase.def.id}
              phase={phase}
              today={today}
              open={overrides[phase.def.id] ?? phase.hasActiveTask}
              onToggle={() =>
                setOverrides((o) => ({ ...o, [phase.def.id]: !(o[phase.def.id] ?? phase.hasActiveTask) }))
              }
            />
          ))}
        </div>

        {journey.unassigned.length > 0 && (
          <p className="mt-4 rounded-lg border border-dashed border-hairline p-3 text-xs text-fg-2">
            {journey.unassigned.length} materi tidak cocok dengan fase mana pun: {journey.unassigned.map((t) => t.title).join(", ")}.
          </p>
        )}
      </div>
    </main>
  );
}
