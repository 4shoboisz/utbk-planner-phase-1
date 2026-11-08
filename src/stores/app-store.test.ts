import { describe, expect, it } from "vitest";
import { redo, undo, useAppStore } from "./app-store";

function addEvent(id: string) {
  return useAppStore.getState().saveEvent({ id, title: "GO tutoring", date: "2026-11-09", start: 1080, end: 1140, allDay: false, color: "blue" });
}

describe("calendar undo / redo", () => {
  it("steps back and forward through event changes", () => {
    addEvent("utbk-test-1");
    useAppStore.getState().moveEvent("utbk-test-1", { date: "2026-11-10", start: 780, end: 840 });
    const moved = useAppStore.getState().events.find((event) => event.id === "utbk-test-1")!;
    expect(moved.start).toBe(780);
    expect(undo()).toBe("Calendar");
    expect(useAppStore.getState().events.find((event) => event.id === "utbk-test-1")!.date).toBe("2026-11-09");
    expect(redo()).toBe("Calendar");
    expect(useAppStore.getState().events.find((event) => event.id === "utbk-test-1")!.date).toBe("2026-11-10");
  });

  it("restores a deleted calendar event", () => {
    addEvent("utbk-test-2");
    useAppStore.getState().deleteEvent("utbk-test-2");
    expect(useAppStore.getState().events.some((event) => event.id === "utbk-test-2")).toBe(false);
    expect(undo()).toBe("Calendar");
    expect(useAppStore.getState().events.some((event) => event.id === "utbk-test-2")).toBe(true);
  });

  it("does not record notifications", () => {
    while (undo()) { /* drain history */ }
    useAppStore.getState().notify({ title: "t", body: "b" });
    expect(undo()).toBeNull();
  });
});
