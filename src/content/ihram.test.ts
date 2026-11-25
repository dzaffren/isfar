import { describe, expect, it } from "vitest";
import { IHRAM } from "./ihram";

const LANGUAGES = ["ms", "en"] as const;
const withField = (field: "recitation" | "note") => (language: (typeof LANGUAGES)[number]) =>
  IHRAM[language].flatMap((step, index) => (step[field] ? [index + 1] : []));

describe("the steps of the ihram walk", () => {
  it("has 8 steps in each language (D89)", () => {
    expect(IHRAM.ms).toHaveLength(8);
    expect(IHRAM.en).toHaveLength(8);
  });

  it("keeps each step text to 40 words or fewer", () => {
    for (const language of LANGUAGES) {
      for (const step of IHRAM[language]) {
        expect(step.text.split(/\s+/).length, step.title).toBeLessThanOrEqual(40);
      }
    }
  });

  it("names the steps of the scenarios", () => {
    expect(IHRAM.ms[0].title).toBe("Bir Ali dan bahagiannya");
    expect(IHRAM.ms[3].title).toBe("Solat sunat ihram");
    expect(IHRAM.ms[7].title).toBe("Ke Makkah");
    expect(IHRAM.en[3].title).toBe("Solat sunat ihram");
  });

  it("shows the niat on step 5 and the talbiyah on step 6 only, with the same Arabic in each language (D90)", () => {
    for (const language of LANGUAGES) expect(withField("recitation")(language)).toEqual([5, 6]);
    expect(IHRAM.ms[4].recitation!.sound).toBe("Nawaitul 'umrata wa ahramtu biha lillahi ta'ala");
    expect(IHRAM.ms[5].recitation!.sound).toMatch(/^Labbaik Allahumma labbaik/);
    for (const index of [4, 5]) {
      expect(IHRAM.en[index].recitation!.arabic).toBe(IHRAM.ms[index].recitation!.arabic);
      expect(IHRAM.en[index].recitation!.sound).toBe(IHRAM.ms[index].recitation!.sound);
      expect(IHRAM.en[index].recitation!.meaning).not.toBe(IHRAM.ms[index].recitation!.meaning);
    }
  });

  it("notes the other schools on steps 2, 3, 6 and 8", () => {
    for (const language of LANGUAGES) expect(withField("note")(language)).toEqual([2, 3, 6, 8]);
  });

  it("tells a pilgrim on a plane what to do, in the text of step 5 (D88, D98)", () => {
    expect(IHRAM.ms[4].text).toContain("kapal terbang");
    expect(IHRAM.en[4].text).toContain("on the plane before the miqat");
  });
});
