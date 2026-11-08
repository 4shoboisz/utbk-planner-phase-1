import { beforeEach, describe, expect, it } from "vitest";
import { useStudyStore } from "./study-store";

const reflection = "Hari ini saya mempelajari operasi bilangan bulat secara bertahap, memahami urutan pengerjaan, dan mencoba beberapa contoh soal dasar untuk menguji pemahaman saya sebelum melanjutkan materi berikutnya.";

describe("study persistence", () => {
  beforeEach(() => {
    useStudyStore.getState().resetStudyData();
  });

  it("preserves completion and reflection across export, reset, and restore", () => {
    const active = useStudyStore.getState().tasks.find((task) => !task.locked && task.status === "pending");
    expect(active).toBeDefined();
    expect(useStudyStore.getState().completeTask(active!.id, reflection, "partial")).toBe(true);

    const exported = useStudyStore.getState().exportData();
    useStudyStore.getState().resetStudyData();
    expect(useStudyStore.getState().reflections).toHaveLength(0);

    expect(useStudyStore.getState().importData(exported)).toBe(true);
    const restoredTask = useStudyStore.getState().tasks.find((task) => task.id === active!.id);
    expect(restoredTask?.status).toBe("completed");
    expect(restoredTask?.completedAt).toBeTruthy();
    expect(restoredTask?.mastery).toBe("partial");
    expect(useStudyStore.getState().reflections).toHaveLength(1);
    expect(useStudyStore.getState().reflections[0].taskId).toBe(active!.id);
  });

  it("rejects imports that omit or duplicate permanent curriculum tasks", () => {
    const data = JSON.parse(useStudyStore.getState().exportData());
    data.tasks = data.tasks.slice(1);
    expect(useStudyStore.getState().importData(JSON.stringify(data))).toBe(false);

    data.tasks = [...data.tasks, data.tasks[0]];
    expect(useStudyStore.getState().importData(JSON.stringify(data))).toBe(false);
  });
});
