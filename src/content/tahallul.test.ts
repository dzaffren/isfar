import { describe, expect, it } from "vitest";
import { TAHALLUL } from "./tahallul";

const LANGUAGES = ["ms", "en"] as const;

describe("the steps of tahallul", () => {
  it("has 2 steps in each language", () => {
    expect(TAHALLUL.ms).toHaveLength(2);
    expect(TAHALLUL.en).toHaveLength(2);
  });

  it("keeps each step text to 40 words or fewer", () => {
    for (const language of LANGUAGES) {
      for (const step of TAHALLUL[language]) {
        expect(step.text.split(/\s+/).length, step.title).toBeLessThanOrEqual(40);
      }
    }
  });

  it("names the steps of the scenarios", () => {
    expect(TAHALLUL.ms[0].title).toBe("Bercukur atau bergunting");
    expect(TAHALLUL.ms[1].title).toBe("Umrah selesai");
  });

  it("shows a note on step 1 only, and no recitation", () => {
    for (const language of LANGUAGES) {
      expect(TAHALLUL[language].map((step) => Boolean(step.note))).toEqual([true, false]);
      expect(TAHALLUL[language].some((step) => step.recitation)).toBe(false);
    }
  });
});
