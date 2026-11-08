"use client";

import { CheckCircle2Icon } from "lucide-react";
import { groupCurriculum } from "@/features/curriculum/curriculum-phases";
import { PHASE_COLORS } from "@/components/roadmap/roadmap-phase";
import { useStudyStore } from "@/stores/study-store";
import { GradientProgress } from "./gradient-progress";

export function ProgressView() {
  const tasks = useStudyStore((state) => state.tasks);
  const reflections = useStudyStore((state) => state.reflections);
  const completed = tasks.filter((task) => task.status === "completed").length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const mastery = {
    understood: tasks.filter((task) => task.mastery === "understood").length,
    partial: tasks.filter((task) => task.mastery === "partial").length,
    review: tasks.filter((task) => task.mastery === "review").length,
  };

  return (
    <main className="page-enter min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-semibold text-fg">Progress</h1>
        <p className="mt-1 text-sm text-fg-2">
          Fundamental Learning completion and self-assessment.
        </p>
        <div className="mt-6 rounded-lg border border-hairline glass p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-fg-2">Completed</p>
              <p className="mt-1 text-3xl font-semibold text-fg">{percent}%</p>
            </div>
            <p className="text-sm text-fg-2">
              {completed} / {tasks.length}
            </p>
          </div>
          <GradientProgress value={percent} label="Progres keseluruhan" className="mt-4" />
        </div>
        <div className="mt-4 rounded-lg border border-hairline glass p-5">
          <p className="text-sm font-medium text-fg">Per fase</p>
          <ul className="mt-3 space-y-4">
            {groupCurriculum(tasks).phases.map((phase) => {
              const colors = PHASE_COLORS[phase.def.accent];
              return (
                <li key={phase.def.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-fg">
                      Phase {String(phase.def.number).padStart(2, "0")} — {phase.def.title}
                    </span>
                    <span className="shrink-0 text-xs text-fg-2 tabular-nums">
                      {phase.completed} / {phase.total} · {phase.percent}%
                    </span>
                  </div>
                  <GradientProgress
                    value={phase.percent}
                    label={`Progres ${phase.def.title}`}
                    from={colors.from}
                    mid={colors.solid}
                    to={colors.solid}
                    className="mt-2 h-1.5"
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ["Understand the material", mastery.understood],
            ["Understand some parts", mastery.partial],
            ["Need review", mastery.review],
          ].map(([label, count]) => (
            <div
              key={String(label)}
              className="rounded-lg border border-hairline glass p-4"
            >
              <p className="flex items-center gap-2 text-sm text-fg">
                <CheckCircle2Icon className="size-4 text-success" />
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-fg">{count}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-hairline glass p-5">
          <p className="text-sm font-medium text-fg">Study reflections</p>
          <p className="mt-1 text-sm text-fg-2">
            {reflections.length
              ? `${reflections.length} reflection${
                  reflections.length === 1 ? "" : "s"
                } saved locally`
              : "No reflections submitted yet."}
          </p>
        </div>
      </div>
    </main>
  );
}
