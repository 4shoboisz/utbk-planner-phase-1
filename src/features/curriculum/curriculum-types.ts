export type Understanding = "understood" | "partial" | "review";

export type StudyReflection = {
  id: string;
  taskId: string;
  submittedAt: string;
  text: string;
  understanding: Understanding;
};

export type PersonalAvailability = {
  startMinutes: number;
  flexible: boolean;
};

export type StudyTaskStatus = "pending" | "completed";

export type StudyTask = {
  id: string;
  order: number;
  title: string;
  description?: string;
  subtest: string;
  /** Independent subtest queues this topic belongs to (shared topics list several). */
  subtestIds?: string[];
  estimatedMinutes: number;
  originalDate: string;
  status: StudyTaskStatus;
  completedAt?: string;
  locked: boolean;
  mastery?: Understanding;
};

export type StudySession = {
  id: string;
  date: string;
  start: string;
  end: string;
  minutes: number;
  subtestId?: string;
  notes?: string;
};
