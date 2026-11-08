"use client";

import { EventDialog } from "./event-dialog";
import { ShortcutsDialog } from "./info-dialogs";
import { StudyCheckinDialog } from "@/components/study/study-checkin-dialog";
import { StudyLogDialog } from "@/components/study/study-log-dialog";
import { useOverlayStore, type Overlay } from "@/stores/overlay-store";
import { useState } from "react";

type Kind = Exclude<Overlay["kind"], "none" | "search">;
type Latest = { [K in Kind]?: Extract<Overlay, { kind: K }> };

/**
 * Hosts every app-wide dialog. The last payload of each kind is kept around so
 * a dialog keeps its content while it animates out after closing.
 */
export function GlobalDialogs() {
  const overlay = useOverlayStore((state) => state.overlay);
  const close = useOverlayStore((state) => state.close);
  const [latest, setLatest] = useState<Latest>({});
  const [session, setSession] = useState(0);
  const [previous, setPrevious] = useState<Overlay>(overlay);

  // Derive state during render (no effect): remember payloads and count opens.
  if (overlay !== previous) {
    setPrevious(overlay);
    if (overlay.kind !== "none" && overlay.kind !== "search") {
      setLatest((current) => ({ ...current, [overlay.kind]: overlay }));
      setSession((value) => value + 1);
    }
  }

  const is = (kind: Kind) => overlay.kind === kind;

  return (
    <>
      <EventDialog
        open={is("event")}
        session={session}
        onClose={close}
        eventId={latest.event?.eventId}
        date={latest.event?.date}
        start={latest.event?.start}
        end={latest.event?.end}
        allDay={latest.event?.allDay}
      />
      <StudyCheckinDialog
        open={is("study-checkin")}
        taskId={latest["study-checkin"]?.taskId}
        onClose={close}
      />
      <StudyLogDialog open={is("study-log")} onClose={close} />
      <ShortcutsDialog open={is("shortcuts")} onClose={close} />
    </>
  );
}
