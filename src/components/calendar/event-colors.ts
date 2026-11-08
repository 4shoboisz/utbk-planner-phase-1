import type { CSSProperties } from "react";
import type { EventColor } from "@/lib/types";

export const EVENT_COLORS: EventColor[] = [
  "blue",
  "cyan",
  "green",
  "orange",
  "pink",
  "purple",
  "teal",
  "slate",
];

/** Inline style for an event surface using paired bg/fg tokens. */
export function eventStyle(color: EventColor): CSSProperties {
  return {
    background: `var(--event-${color}-bg)`,
    color: `var(--event-${color}-fg)`,
  };
}