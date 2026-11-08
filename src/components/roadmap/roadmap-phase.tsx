"use client";

import { CheckIcon, ChevronDownIcon, ClockIcon, LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientProgress } from "@/components/progress/gradient-progress";
import { completionDateKey, splitTopicTitle, type LevelGroup, type PhaseAccent, type PhaseGroup } from "@/features/curriculum/curriculum-phases";
import type { StudyTask, Understanding } from "@/features/curriculum/curriculum-types";
import { getOverdueCount } from "@/features/scheduling/scheduler";
import { formatLong, formatShort } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { openOverlay } from "@/stores/overlay-store";

/** Each phase gets its own hue: emerald, mint, lime, coral. */
export const PHASE_COLORS: Record<PhaseAccent, { solid: string; from: string }> = {
  emerald: { solid: "#3fb27a", from: "#1f6a47" },
  mint: { solid: "#6fd6c0", from: "#17756a" },
  lime: { solid: "#c7f36b", from: "#5c8a1f" },
  coral: { solid: "#ff8a73", from: "#b8553f" },
};

const MASTERY_LABEL: Record<Understanding, string> = {
  understood: "Paham",
  partial: "Paham sebagian",
  review: "Perlu diulang",
};

function TopicCard({ task, today }: { task: StudyTask; today: string }) {
  const completed = task.status === "completed";
  const active = !completed && !task.locked;
  const overdue = active ? getOverdueCount(task, today) : 0;
  const { name, detail } = splitTopicTitle(task.title);

  return (
    <li
      aria-current={active ? "step" : undefined}
      data-state={completed ? "completed" : active ? "active" : "locked"}
      style={active ? { borderColor: "var(--phase)" } : undefined}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 transition-colors duration-150",
        completed && "border-hairline bg-surface/60",
        active && "bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
        !completed && !active && "border-hairline bg-surface/40 opacity-70",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
          completed && "bg-[var(--status-success-tint)] text-success",
          active && "text-[#071f18]",
          !completed && !active && "bg-hover text-fg-2",
        )}
        style={active ? { backgroundImage: "linear-gradient(135deg, var(--phase-from), var(--phase))" } : undefined}
      >
        {completed ? <CheckIcon className="task-checkmark-enter size-3.5" /> : task.locked ? <LockIcon className="size-3.5" /> : task.order}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 font-medium text-fg">
          {name}
        </p>
        {detail && <p className="mt-0.5 text-xs leading-4 text-fg-2">{detail}</p>}
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-2">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3" aria-hidden />
            {task.estimatedMinutes} menit
          </span>
          {completed && task.completedAt ? (
            <span className="text-success">Selesai {formatLong(completionDateKey(task.completedAt))}</span>
          ) : (
            <span>Dijadwalkan {formatShort(task.originalDate)}</span>
          )}
          {completed && task.mastery && <span>{MASTERY_LABEL[task.mastery]}</span>}
          {overdue > 0 && (
            <span className="rounded-full bg-[var(--status-warning-tint)] px-2 py-0.5 font-medium text-warning">
              Terlambat {overdue} hari
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center">
        {completed ? (
          <span className="sr-only">Selesai</span>
        ) : active ? (
          <Button size="sm" variant="brand" onClick={() => openOverlay({ kind: "study-checkin", taskId: task.id })}>
            Check-in
          </Button>
        ) : (
          <span className="text-xs text-fg-2">Terkunci</span>
        )}
      </div>
    </li>
  );
}

function LevelSection({ level, today }: { level: LevelGroup; today: string }) {
  const { label, numeral, topic } = level.def;
  return (
    <section aria-label={topic ? `${label} — ${topic}` : label} className="mt-5 first:mt-0">
      <div className="mb-2 flex items-end justify-between gap-3">
        <h3 className="min-w-0 text-[13px] font-semibold text-heading">
          {numeral && <span className="mr-1.5 text-fg-2">{numeral}.</span>}
          {label}
          {topic && <span className="font-normal text-fg-2"> — {topic}</span>}
        </h3>
        <span className="shrink-0 text-xs text-fg-2 tabular-nums">
          {level.completed} / {level.total} materi
        </span>
      </div>
      <GradientProgress
        value={level.percent}
        label={`Progres ${label}`}
        from="var(--phase-from)"
        mid="var(--phase)"
        to="var(--phase)"
        className="mb-3 h-1"
      />
      <ol className="space-y-2">
        {level.tasks.map((task) => (
          <TopicCard key={task.id} task={task} today={today} />
        ))}
      </ol>
    </section>
  );
}

export function PhaseSection({
  phase,
  open,
  onToggle,
  today,
}: {
  phase: PhaseGroup;
  open: boolean;
  onToggle: () => void;
  today: string;
}) {
  const { def } = phase;
  const colors = PHASE_COLORS[def.accent];
  const bodyId = `${def.id}-body`;
  const done = phase.total > 0 && phase.completed === phase.total;

  return (
    <section
      aria-labelledby={`${def.id}-title`}
      style={{ "--phase": colors.solid, "--phase-from": colors.from } as React.CSSProperties}
      className="overflow-hidden rounded-2xl border border-hairline glass"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="press flex w-full items-center gap-4 p-4 text-left outline-none hover-fine:bg-hover/50 focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-inset"
      >
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-[#071f18] tabular-nums"
          style={{ backgroundImage: "linear-gradient(135deg, var(--phase-from), var(--phase))" }}
        >
          {String(def.number).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span id={`${def.id}-title`} className="text-[15px] leading-5 font-semibold text-heading">
              Phase {String(def.number).padStart(2, "0")} — {def.title}
            </span>
            <span className="rounded-full border border-hairline px-2 py-0.5 text-[11px] text-fg-2">{def.subtests}</span>
            {done && <span className="rounded-full bg-[var(--status-success-tint)] px-2 py-0.5 text-[11px] font-medium text-success">Selesai</span>}
          </span>
          <span className="mt-1 block text-xs text-fg-2 tabular-nums">
            {phase.completed} / {phase.total} materi · {phase.levels.length} level · {phase.percent}%
          </span>
          <GradientProgress
            value={phase.percent}
            label={`Progres ${def.title}`}
            from={colors.from}
            mid={colors.solid}
            to={colors.solid}
            className="mt-2.5 h-1.5"
          />
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn("size-4 shrink-0 text-icon transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")}
        />
      </button>

      {open && (
        <div id={bodyId} className="border-t border-hairline p-4">
          {phase.levels.map((level) => (
            <LevelSection key={level.def.label + (level.def.topic ?? "")} level={level} today={today} />
          ))}
        </div>
      )}
    </section>
  );
}
