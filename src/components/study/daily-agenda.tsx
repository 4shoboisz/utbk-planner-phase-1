"use client";

import { ChevronRightIcon, Clock3Icon, TimerIcon } from "lucide-react";
import { useToday } from "@/hooks/use-today";
import { useStudyStore } from "@/stores/study-store";
import { openOverlay } from "@/stores/overlay-store";
import { getAvailableTasks, getOverdueCount } from "@/features/scheduling/scheduler";
import { cn } from "@/lib/utils";

/** Compact agenda: one row per available task; the row opens the check-in detail. Internal order stays in the data layer. */
export function DailyAgenda() {
  const tasks = useStudyStore((state) => state.tasks);
  const targetMinutes = useStudyStore((state) => state.targetMinutes);
  const today = useToday();
  const available = getAvailableTasks(tasks);
  const todayMinutes = useStudyStore((state) => state.sessions.filter((item) => item.date === today).reduce((sum, item) => sum + item.minutes, 0));

  return (
    <aside className="glass-panel flex max-h-[45dvh] w-full shrink-0 flex-col border-t border-hairline md:max-h-full md:w-[280px] md:border-t-0 md:border-l" aria-label="Daily study agenda">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-hairline p-3">
        <div><p className="text-sm font-semibold text-fg">Agenda hari ini</p><p className="mt-0.5 text-xs text-fg-2 tabular-nums">Target {targetMinutes} menit · tercatat {todayMinutes}</p></div>
        <Clock3Icon className="size-4 text-icon" />
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-2">
        {available.length === 0 ? <p className="p-2 text-xs text-fg-2">Semua materi Fundamental sudah selesai.</p> : (
          <ul className="space-y-1">
            {available.map((task) => {
              const carried = getOverdueCount(task, today);
              const level = task.subtest.split(" — ")[1];
              return (
                <li key={task.id}>
                  <button type="button" onClick={() => openOverlay({ kind: "study-checkin", taskId: task.id })} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-brand">
                    <span className="w-9 shrink-0 text-[11px] font-semibold text-fg-2">{task.subtestIds?.[0] ?? "—"}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm text-fg">{task.title}</span>{level || carried > 0 ? <span className="block truncate text-[11px] text-fg-2">{[level, carried > 0 ? `tertunda ${carried} hari` : ""].filter(Boolean).join(" · ")}</span> : null}</span>
                    <span aria-label={carried > 0 ? "Tertunda" : "Tersedia"} className={cn("size-1.5 shrink-0 rounded-full", carried > 0 ? "bg-warning" : "bg-success")} />
                    <ChevronRightIcon className="size-3.5 shrink-0 text-icon" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="shrink-0 border-t border-hairline p-2"><button type="button" onClick={() => openOverlay({ kind: "study-log" })} className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-hover"><TimerIcon className="size-3.5" />Catat waktu belajar</button></div>
    </aside>
  );
}
