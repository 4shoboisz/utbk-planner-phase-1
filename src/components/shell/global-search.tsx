"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { CalendarDaysIcon, CalendarPlusIcon, MoonIcon, SunIcon } from "lucide-react";
import { Icon } from "@/components/icon";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { ALL_PAGES } from "@/lib/nav";
import { formatLong, formatShort, formatTimeRange } from "@/lib/dates";
import { useToday } from "@/hooks/use-today";
import { useAppStore } from "@/stores/app-store";
import { useStudyStore } from "@/stores/study-store";
import { useCalendarStore } from "@/stores/calendar-store";
import { openOverlay, useOverlayStore } from "@/stores/overlay-store";

/** The title-bar search field. Opens a command palette (⌘K / "/"). */
export function GlobalSearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => openOverlay({ kind: "search" })}
      className="press flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-lg border border-control bg-surface text-left outline-none transition-[border-color,box-shadow] duration-150 hover-fine:border-segment focus-visible:ring-3 focus-visible:ring-brand/15 md:w-48 md:justify-start md:px-2.5 xl:w-60"
      aria-label="Search"
      aria-keyshortcuts="Meta+K"
    >
      <Icon name="search" />
      <span className="t-14 hidden min-w-0 flex-1 text-placeholder md:block">Search...</span>
    </button>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const open = useOverlayStore((state) => state.overlay.kind === "search");
  const close = useOverlayStore((state) => state.close);
  const [query, setQuery] = useState("");
  const events = useAppStore((state) => state.events);
  const tasks = useStudyStore((state) => state.tasks);
  const timeFormat = useAppStore((state) => state.settings.timeFormat);
  const { resolvedTheme, setTheme } = useTheme();
  const today = useToday();

  // ⌘K / Ctrl+K toggles the palette instantly — no animation for keyboard actions.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const overlay = useOverlayStore.getState().overlay;
        if (overlay.kind === "search") close();
        else openOverlay({ kind: "search" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const run = (action: () => void) => {
    close();
    action();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(value) => !value && close()}
      title="Search"
      description="Search pages, study tasks, and calendar events"
      className="sm:max-w-[560px] max-sm:top-2 max-sm:bottom-auto max-sm:left-2 max-sm:w-[calc(100%-1rem)]"
    >
      {/* cmdk needs a <Command> root around its input and list. */}
      <Command>
        <CommandInput value={query} onValueChange={setQuery} placeholder="Search planner…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => run(() => openOverlay({ kind: "event", date: today }))}>
              <CalendarPlusIcon /> Add schedule
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(() => { useCalendarStore.getState().setDate(today); router.push("/"); })}>
              <CalendarDaysIcon /> Go to today
              <CommandShortcut>T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>
              {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />} Toggle theme
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Pages">
            {ALL_PAGES.map((page) => (
              <CommandItem key={page.href} value={`page ${page.label}`} onSelect={() => run(() => router.push(page.href))}>
                <Icon name={page.icon} /> {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Study tasks">
            {tasks.map((task) => (
              <CommandItem key={task.id} value={`task ${task.title} ${task.subtest}`} onSelect={() => run(() => router.push("/roadmap"))}>
                <span className="size-2 shrink-0 rounded-full bg-brand" />
                <span className="min-w-0 flex-1 truncate">{task.title}</span>
                <CommandShortcut>{task.status === "completed" ? "Completed" : task.locked ? "Locked" : "Active"}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Events">
            {events.map((event) => (
              <CommandItem key={event.id} value={`event ${event.title} ${event.note ?? ""} ${formatLong(event.date)}`} onSelect={() => run(() => { useCalendarStore.getState().focusEvent(event.id, event.date); router.push("/"); })}>
                <span className="size-2 shrink-0 rounded-full" style={{ background: `var(--event-${event.color}-fg)` }} />
                <span className="min-w-0 flex-1 truncate">{event.title}</span>
                <CommandShortcut>
                  {formatShort(event.date)}
                  {!event.allDay && ` · ${formatTimeRange(event.start, event.end, timeFormat)}`}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
