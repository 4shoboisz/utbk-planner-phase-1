/** The seven independent UTBK subtest queues. Phases only group topics; queues decide what unlocks. */
export const SUBTEST_IDS = ["PK", "PU", "PPU", "PBM", "LBI", "LBE", "PM"] as const;
export type SubtestId = (typeof SUBTEST_IDS)[number];

/** "PK / PM — Easy" -> ["PK","PM"]. PUK is only a source label for PU, so it never becomes a queue. */
export function subtestIdsFromLabel(label: string): string[] {
  const head = label.split(" — ")[0];
  return head.split(/[\/&]/).map((part) => part.trim()).filter((part) => part && part !== "PUK");
}
