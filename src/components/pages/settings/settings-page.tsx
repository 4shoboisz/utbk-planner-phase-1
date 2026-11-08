"use client";

import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import {
  CalendarDaysIcon,
  CheckIcon,
  DatabaseIcon,
  DownloadIcon,
  PaletteIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTime } from "@/lib/dates";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useStudyStore } from "@/stores/study-store";
import { Card, PageHeader, PageRoot } from "@/components/pages/shared/page-chrome";
import { useToday } from "@/hooks/use-today";

const TABS = [
  { value: "general", label: "General", icon: SlidersHorizontalIcon },
  { value: "availability", label: "Study availability", icon: CalendarDaysIcon },
  { value: "appearance", label: "Appearance", icon: PaletteIcon },
  { value: "data", label: "Data", icon: DatabaseIcon },
] as const;

const noopSubscribe = () => () => {};

function useSettings() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => updateSettings({ [key]: value } as Partial<Settings>);
  return [settings, set] as const;
}

export function SettingsPage() {
  const [tab, setTab] = useState<string>("general");
  return (
    <PageRoot>
      <PageHeader title="Settings" />
      {/* Title -> horizontal tab row -> active panel. The row scrolls sideways on phones instead of wrapping. */}
      <Tabs value={tab} onValueChange={setTab} className="mx-auto w-full max-w-[960px] flex-col gap-4 p-4 md:gap-5 md:p-6">
        <TabsList
          aria-label="Settings sections"
          className={cn(
            "glass-panel h-auto w-full min-w-0 justify-start gap-1 overflow-x-auto overscroll-x-contain rounded-xl border border-hairline p-1",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {TABS.map(({ value, label, icon: Glyph }) => (
            <TabsTrigger
              key={value}
              value={value}
              // Keep a tapped, half-hidden tab fully in view.
              onClick={(e) => e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })}
              className={cn(
                "t-14 salt h-9 w-auto flex-none justify-start gap-2 rounded-lg border-0 px-3 text-[14px] text-fg-2 after:hidden",
                "transition-[background-color,color,box-shadow] duration-150",
                "hover-fine:bg-hover hover-fine:text-fg",
                "data-active:bg-selected data-active:text-fg data-active:shadow-[inset_0_-2px_0_0_#729ED6]",
                "dark:data-active:border-transparent dark:data-active:bg-selected",
                "focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#729ED6]/50",
                "[&_svg]:size-3.5! [&_svg]:text-icon",
              )}
            >
              <Glyph /> {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="min-w-0">
          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="availability">
            <StudyAvailabilityTab />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>
          <TabsContent value="data">
            <DataTab />
          </TabsContent>
        </div>
      </Tabs>
    </PageRoot>
  );
}

/* ------------------------------------------------------------------ building blocks */

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2 px-1">
        <h3 className="t-16 text-fg">{title}</h3>
        <p className="t-14 text-fg-2">{description}</p>
      </div>
      <Card className="divide-y divide-subtle">{children}</Card>
    </div>
  );
}

/** Phones: selects and buttons grow to 40px touch targets (and fill the row when stacked). */
const TOUCH_CONTROL = "max-md:h-10!";

function Row({
  title,
  description,
  htmlFor,
  stack = false,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  htmlFor?: string;
  /** Put the control under the label on phones (selects, steppers, buttons); switches stay inline. */
  stack?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[68px] items-center gap-4 px-4 py-3 sm:gap-6",
        stack && "max-sm:flex-col max-sm:items-stretch max-sm:gap-3 max-sm:py-3.5",
      )}
    >
      <div className="grid min-w-0 flex-1 gap-1.5">
        <label htmlFor={htmlFor} className="t-14 text-fg">
          {title}
        </label>
        {description ? <p className="t-12 leading-[1.4] text-fg-2">{description}</p> : null}
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center gap-2",
          stack && "max-sm:*:flex-1",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ general */

function GeneralTab() {
  const [settings, set] = useSettings();
  return (
    <Panel title="General" description="How dates and times appear across your calendar.">
      <Row title="Week starts on" description="First column in week and month views" htmlFor="st-week" stack>
        <Select
          value={String(settings.weekStartsOn)}
          onValueChange={(v) => set("weekStartsOn", Number(v) as 0 | 1)}
        >
          <SelectTrigger id="st-week" className={cn("w-40", TOUCH_CONTROL)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Sunday</SelectItem>
            <SelectItem value="1">Monday</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Time format" description="Used for events, requests and time entries" htmlFor="st-time" stack>
        <Select value={settings.timeFormat} onValueChange={(v) => set("timeFormat", v as Settings["timeFormat"])}>
          <SelectTrigger id="st-time" className={cn("w-40", TOUCH_CONTROL)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24-hour · 14:30</SelectItem>
            <SelectItem value="12h">12-hour · 2:30 PM</SelectItem>
          </SelectContent>
        </Select>
      </Row>
      <Row title="Calendar day starts at" description="Day and week views scroll to this hour" htmlFor="st-start" stack>
        <Select value={String(settings.dayStartHour)} onValueChange={(v) => set("dayStartHour", Number(v))}>
          <SelectTrigger id="st-start" className={cn("w-40", TOUCH_CONTROL)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {Array.from({ length: 13 }, (_, h) => (
              <SelectItem key={h} value={String(h)}>
                {formatTime(h * 60, settings.timeFormat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
      <Row title="Show weekends" description="Hide Saturday and Sunday to focus on the work week" htmlFor="st-weekends">
        <Switch id="st-weekends" checked={settings.showWeekends} onCheckedChange={(v) => set("showWeekends", v)} />
      </Row>
    </Panel>
  );
}

/* ------------------------------------------------------------------ appearance */

// A preview has to show a theme other than the active one, so it pins the
// relevant tokens locally (globals.css only scopes dark, via [data-theme=dark]).
const PREVIEW_TOKENS: Record<"light" | "dark", React.CSSProperties> = {
  light: {
    "--bg-app": "#F1F5F2",
    "--bg-surface": "#F9FBF9",
    "--bg-selected": "#DDE9DF",
    "--bg-hover": "#E8F4F4ECEA",
    "--border-hairline": "#e5e7e1",
    "--text-primary": "#1d1d1d",
    "--event-green-bg": "#bde7db",
    "--event-purple-bg": "#e3daf7",
    "--event-blue-bg": "#c5e2f9",
  } as React.CSSProperties,
  dark: {
    "--bg-app": "#121212",
    "--bg-surface": "#181818",
    "--bg-selected": "#262624",
    "--bg-hover": "#232321",
    "--border-hairline": "#2a2a28",
    "--text-primary": "#ededed",
    "--event-green-bg": "#123d31",
    "--event-purple-bg": "#2d2547",
    "--event-blue-bg": "#17324a",
  } as React.CSSProperties,
};

function ThemePreview({ theme }: { theme: "light" | "dark" }) {
  return (
    <div style={PREVIEW_TOKENS[theme]} className="flex h-24 overflow-hidden rounded-lg border border-hairline bg-app" aria-hidden>
      <div className="flex w-1/3 flex-col gap-1.5 border-r border-hairline p-2">
        <span className="h-1.5 w-3/4 rounded-full bg-selected" />
        <span className="h-1.5 w-1/2 rounded-full bg-hover" />
        <span className="h-1.5 w-2/3 rounded-full bg-hover" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 bg-surface p-2">
        <span className="h-1.5 w-1/2 rounded-full bg-[var(--text-primary)] opacity-80" />
        <div className="mt-1 grid flex-1 grid-cols-3 gap-1">
          <span className="rounded-[4px] bg-[var(--event-green-bg)]" />
          <span className="rounded-[4px] bg-[var(--event-purple-bg)]" />
          <span className="rounded-[4px] bg-[var(--event-blue-bg)]" />
        </div>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const current = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : null;

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 px-1">
        <h3 className="t-16 text-fg">Appearance</h3>
        <p className="t-14 text-fg-2">Pick a theme for this browser. You can also toggle it from the sidebar.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4" role="radiogroup" aria-label="Theme">
        {(["light", "dark"] as const).map((t) => {
          const active = current === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(t)}
              className={cn(
                "press grid gap-3 rounded-xl border bg-surface p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                active ? "border-brand ring-1 ring-brand" : "border-hairline hover-fine:border-segment",
              )}
            >
              <ThemePreview theme={t} />
              <span className="flex items-center gap-2 px-0.5">
                <span className="t-14 flex-1 text-fg">{t === "light" ? "Light" : "Dark"}</span>
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border transition-colors duration-150",
                    active ? "border-brand bg-brand text-white" : "border-control",
                  )}
                >
                  {active ? <CheckIcon className="size-2.5" strokeWidth={3} /> : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ data */

function DataTab() {
  const today = useToday();
  const counts = useAppStore(selectCountsLabel);
  const resetDemoData = useAppStore((state) => state.resetDemoData);
  const resetStudyData = useStudyStore((state) => state.resetStudyData);

  const exportJson = () => {
    const app = useAppStore.getState();
    const appData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(app)) if (typeof value !== "function") appData[key] = value;
    const study = useStudyStore.getState();
    const studyData = study.exportData();
    const blob = new Blob([JSON.stringify({ format: "utbk-planner-backup", version: 1, exportedAt: new Date().toISOString(), app: appData, study: JSON.parse(studyData) }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utbk-planner-${today}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Backup exported", { description: `utbk-planner-${today}.json · ${formatBytes(blob.size)}` });
  };

  const importJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text()) as { format?: string; app?: unknown; study?: unknown };
        if (data.format !== "utbk-planner-backup" || !data.app || !data.study) throw new Error("Invalid backup format");
        const app = data.app as { events?: unknown[]; settings?: unknown };
        if (!Array.isArray(app.events) || typeof app.settings !== "object") throw new Error("Invalid app data");
        useAppStore.setState(app as Partial<ReturnType<typeof useAppStore.getState>>);
        if (!useStudyStore.getState().importData(JSON.stringify(data.study))) throw new Error("Invalid study data");
        toast.success("Backup restored", { description: "Calendar, settings, progress, and reflections were restored." });
      } catch {
        toast.error("Import failed", { description: "Choose a valid UTBK Planner JSON backup." });
      }
    };
    input.click();
  };

  return (
    <Panel title="Data" description="Everything lives in this browser's local storage.">
      <Row title="Backup data" description={`${counts}; includes study progress and reflections`} stack>
        <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
          <Button onClick={exportJson} className={TOUCH_CONTROL}><DownloadIcon className="text-icon" /> Export JSON</Button>
          <Button onClick={importJson} className={TOUCH_CONTROL}>Import JSON</Button>
        </div>
      </Row>
      <Row title="Reset planner data" description="Restore the initial UTBK planner state. Export first if you want to keep a copy." stack>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className={TOUCH_CONTROL}><RotateCcwIcon /> Reset</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="t-16">Reset UTBK Planner data?</AlertDialogTitle>
              <AlertDialogDescription className="t-14 leading-[1.4]">
                Calendar events, availability, progress, reflections, and planner settings will be replaced with the initial local state.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="max-sm:h-10">Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" className="max-sm:h-10" onClick={() => { resetDemoData(); resetStudyData(); }}>
                Reset data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Row>
    </Panel>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Selector returning a primitive string, so it is stable across renders. */
function selectCountsLabel(s: ReturnType<typeof useAppStore.getState>) {
  const parts = [
    [s.events.length, "event", "events"],
    [s.requests.length, "request", "requests"],
    [s.documents.length, "document", "documents"],
    [s.timeEntries.length, "time entry", "time entries"],
    [s.invoices.length, "invoice", "invoices"],
  ] as const;
  return `Download ${parts.map(([n, one, many]) => `${n} ${n === 1 ? one : many}`).join(", ")} as JSON`;
}

function StudyAvailabilityTab() {
  const projectStartDate = useStudyStore((state) => state.projectStartDate);
  const targetMinutes = useStudyStore((state) => state.targetMinutes);
  const availability = useStudyStore((state) => state.availability);
  const planningEndDate = useStudyStore((state) => state.planningEndDate);
  const blockedDates = useStudyStore((state) => state.blockedDates);
  const setProjectStartDate = useStudyStore((state) => state.setProjectStartDate);
  const setTargetMinutes = useStudyStore((state) => state.setTargetMinutes);
  const setAvailability = useStudyStore((state) => state.setAvailability);
  const setPlanningEndDate = useStudyStore((state) => state.setPlanningEndDate);
  const setBlockedDates = useStudyStore((state) => state.setBlockedDates);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayNumbers = [1, 2, 3, 4, 5, 6, 0];

  return (
    <Panel title="Study availability" description="Default study windows. Fixed calendar events remain separate and are never moved automatically.">
      <Row title="Project start date" description="Changing this shifts pending dates, not completed history" htmlFor="study-start" stack>
        <Input id="study-start" type="date" value={projectStartDate} onChange={(event) => setProjectStartDate(event.target.value)} className="w-40 max-md:w-full" />
      </Row>
      <Row title="Planning period ends" description="Initial planning period: November 9–22, 2026" htmlFor="planning-end" stack>
        <Input id="planning-end" type="date" value={planningEndDate} onChange={(event) => setPlanningEndDate(event.target.value)} className="w-40 max-md:w-full" />
      </Row>
      <Row title="Independent study target" description="Can be split into shorter sessions" htmlFor="study-target" stack>
        <Select value={String(targetMinutes)} onValueChange={(value) => setTargetMinutes(Number(value))}>
          <SelectTrigger id="study-target" className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="75">75 minutes</SelectItem><SelectItem value="150">150 minutes</SelectItem><SelectItem value="225">225 minutes</SelectItem><SelectItem value="300">300 minutes</SelectItem></SelectContent>
        </Select>
      </Row>
      {dayNumbers.map((day, index) => {
        const item = availability[day];
        const hours = String(Math.floor(item.startMinutes / 60)).padStart(2, "0");
        const minutes = String(item.startMinutes % 60).padStart(2, "0");
        return <Row key={day} title={days[index]} description={item.flexible ? "Flexible / buffer day" : "Available from this time"} htmlFor={`availability-${day}`}>
          <Input id={`availability-${day}`} type="time" value={`${hours}:${minutes}`} onChange={(event) => {
            const [h, m] = event.target.value.split(":").map(Number);
            setAvailability(day, { ...item, startMinutes: h * 60 + m });
          }} className="w-32 max-md:h-10" />
        </Row>;
      })}
      <Row title="Unavailable dates" description="Personal activity dates are blocked from study suggestions" htmlFor="blocked-dates" stack>
        <Input
          id="blocked-dates"
          value={blockedDates.join(", ")}
          onChange={(event) => {
            const dates = event.target.value.split(",").map((value) => value.trim()).filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value));
            setBlockedDates(dates);
          }}
          placeholder="2026-11-13, 2026-11-14"
          className="w-52 max-md:w-full"
        />
      </Row>
    </Panel>
  );
}
