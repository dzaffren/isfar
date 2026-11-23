import { describe, expect, it } from "vitest";
import { TAWAF, beadsAt } from "./tawaf";

const LANGUAGES = ["ms", "en"] as const;

describe("the steps of the walk", () => {
  it("has 15 steps in each language", () => {
    expect(TAWAF.ms).toHaveLength(15);
    expect(TAWAF.en).toHaveLength(15);
  });

  it("keeps each step text to 40 words or fewer", () => {
    for (const language of LANGUAGES) {
      for (const step of TAWAF[language]) {
        expect(step.text.split(/\s+/).length, step.title).toBeLessThanOrEqual(40);
      }
    }
  });

  it("names the steps of the scenarios", () => {
    expect(TAWAF.ms[0].title).toBe("Kaabah dan bahagiannya");
    expect(TAWAF.ms[2].title).toBe("Tempat mula");
    expect(TAWAF.ms[8].title).toBe("Pusingan 2");
    expect(TAWAF.ms[14].title).toBe("Tawaf selesai");
    expect(TAWAF.en[5].title).toBe("Rukun Yamani");
  });

  it("shows a recitation on steps 3 and 7 only, with the same Arabic in each language", () => {
    for (const language of LANGUAGES) {
      const withRecitation = TAWAF[language].flatMap((step, index) => (step.recitation ? [index + 1] : []));
      expect(withRecitation).toEqual([3, 7]);
    }
    expect(TAWAF.ms[6].recitation!.arabic).toBe("رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ");
    expect(TAWAF.en[6].recitation!.arabic).toBe(TAWAF.ms[6].recitation!.arabic);
    expect(TAWAF.en[6].recitation!.sound).toBe(TAWAF.ms[6].recitation!.sound);
    expect(TAWAF.en[6].recitation!.meaning).not.toBe(TAWAF.ms[6].recitation!.meaning);
    expect(TAWAF.ms[2].recitation!.sound).toBe("Bismillahi, Allahu Akbar");
  });

  it("shows a note on steps 2, 5 and 13 only", () => {
    for (const language of LANGUAGES) {
      const withNote = TAWAF[language].flatMap((step, index) => (step.note ? [index + 1] : []));
      expect(withNote).toEqual([2, 5, 13]);
    }
    expect(TAWAF.ms[1].note).toBe(
      "Syafi'i, Maliki dan Hanbali: wuduk ialah syarat sah tawaf. Hanafi: wuduk wajib tetapi bukan syarat. Tawaf tanpa wuduk sah, dan dam dikenakan.",
    );
  });
});

describe("beadsAt", () => {
  it("lights no bead before the circuits", () => {
    expect(beadsAt(1)).toEqual({ done: 0, now: null });
    expect(beadsAt(3)).toEqual({ done: 0, now: null });
  });

  it("makes bead 1 the current bead through circuit 1", () => {
    expect(beadsAt(4)).toEqual({ done: 0, now: 1 });
    expect(beadsAt(8)).toEqual({ done: 0, now: 1 });
  });

  it("gives each later circuit its own bead", () => {
    expect(beadsAt(9)).toEqual({ done: 1, now: 2 });
    expect(beadsAt(14)).toEqual({ done: 6, now: 7 });
  });

  it("marks all seven beads done at the end", () => {
    expect(beadsAt(15)).toEqual({ done: 7, now: null });
  });
});
