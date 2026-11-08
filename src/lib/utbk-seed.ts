import type { AppState } from "./types";

export const STATE_VERSION = 4;
export const DESIGN_DATE = "2026-11-09";
export const SERVER_TODAY = "2026-11-07";

export function createSeed(): AppState {
  return {
    version: STATE_VERSION,
    workspaceId: "utbk-main",
    workspaces: [{ id: "utbk-main", name: "UTBK Planner" }],
    events: [],
    requests: [],
    holidays: [{ id: "hol-uas-buffer", date: "2026-11-20", name: "UAS period — add exact schedule in calendar" }],
    profile: { name: "Student", email: "", initials: "UT", phone: "", jobTitle: "UTBK 2027", department: "Fundamental Learning", manager: "", location: "Asia/Jakarta", startDate: "2026-11-09", birthday: "", address: "", emergencyContact: "", bio: "" },
    settings: { weekStartsOn: 1, timeFormat: "24h", dayStartHour: 6, contractDays: 0, carryoverDays: 0, showWeekends: true, emailNotifications: false, pushNotifications: false, weeklyDigest: false },
    notifications: [], documents: [], timeEntries: [], timer: { running: false, startedAt: null, project: "Fundamental Learning", task: "" }, invoices: [], withdrawalMethods: [], benefits: [],
  };
}
