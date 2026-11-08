import { describe, expect, it } from "vitest";
import { validateReflection } from "./reflection-validation";

describe("study reflection validation", () => {
  it("rejects reflections under 100 characters", () => expect(validateReflection("Belajar matematika dasar")).not.toBeNull());
  it("rejects blank or meaningless submissions", () => expect(validateReflection("a".repeat(120))).not.toBeNull());
  it("accepts a meaningful reflection", () => expect(validateReflection("Hari ini saya mempelajari dasar aritmetika, termasuk operasi bilangan dan urutan pengerjaan. Saya memahami cara menyelesaikan soal yang membutuhkan beberapa langkah secara bertahap.")).toBeNull());
});
