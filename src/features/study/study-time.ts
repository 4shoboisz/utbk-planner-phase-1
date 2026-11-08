/** "17:00" -> minutes since midnight, or null when invalid. */
export function toMinutes(hhmm: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}

/** Duration in minutes; null when a time is invalid or the end is not after the start. */
export function sessionMinutes(start: string, end: string): number | null {
  const s = toMinutes(start);
  const e = toMinutes(end);
  return s === null || e === null || e <= s ? null : e - s;
}
