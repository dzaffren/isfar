import { describe, expect, it } from "vitest";
import { SAI, saiBeadsAt } from "./sai";

const LANGUAGES = ["ms", "en"] as const;

describe("the steps of the sa'i walk", () => {
  it("has 13 steps in each language", () => {
    expect(SAI.ms).toHaveLength(13);
    expect(SAI.en).toHaveLength(13);
  });

  it("keeps each step text to 40 words or fewer", () => {
    for (const language of LANGUAGES) {
      for (const step of SAI[language]) {
        expect(step.text.split(/\s+/).length, step.title).toBeLessThanOrEqual(40);
      }
    }
  });

  it("names the steps of the scenarios", () => {
    expect(SAI.ms[0].title).toBe("Mas'a dan bahagiannya");
    expect(SAI.ms[2].title).toBe("Bukit Safa");
    expect(SAI.ms[5].title).toBe("Bukit Marwah");
    expect(SAI.ms[6].title).toBe("Perjalanan 2");
    expect(SAI.ms[12].title).toBe("Sa'i selesai");
    expect(SAI.en[4].title).toBe("Between the green lights");
  });

  it("shows a recitation on steps 3 and 5 only, with the same Arabic in each language", () => {
    for (const language of LANGUAGES) {
      const withRecitation = SAI[language].flatMap((step, index) => (step.recitation ? [index + 1] : []));
      expect(withRecitation).toEqual([3, 5]);
    }
    expect(SAI.ms[2].recitation!.arabic).toBe("إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ");
    expect(SAI.ms[2].recitation!.sound).toBe("Innas-safa wal-marwata min sha'a'irillah");
    expect(SAI.ms[4].recitation!.sound).toBe("Rabbighfir warham, innaka antal a'azzul akram");
    for (const index of [2, 4]) {
      expect(SAI.en[index].recitation!.arabic).toBe(SAI.ms[index].recitation!.arabic);
      expect(SAI.en[index].recitation!.sound).toBe(SAI.ms[index].recitation!.sound);
      expect(SAI.en[index].recitation!.meaning).not.toBe(SAI.ms[index].recitation!.meaning);
    }
  });

  it("shows a note on step 2 only", () => {
    for (const language of LANGUAGES) {
      const withNote = SAI[language].flatMap((step, index) => (step.note ? [index + 1] : []));
      expect(withNote).toEqual([2]);
    }
    expect(SAI.ms[1].note).toBe(
      "Syafi'i, Maliki dan Hanbali: sa'i ialah rukun umrah, dan umrah tidak sah tanpanya. Hanafi: sa'i wajib tetapi bukan rukun. Jika ditinggalkan, umrah sah dan dam dikenakan.",
    );
  });
});

describe("saiBeadsAt", () => {
  it("lights no bead before the walks", () => {
    expect(saiBeadsAt(1)).toEqual({ done: 0, now: null });
    expect(saiBeadsAt(3)).toEqual({ done: 0, now: null });
  });

  it("makes bead 1 the current bead through walk 1", () => {
    expect(saiBeadsAt(4)).toEqual({ done: 0, now: 1 });
    expect(saiBeadsAt(6)).toEqual({ done: 0, now: 1 });
  });

  it("gives each later walk its own bead", () => {
    expect(saiBeadsAt(7)).toEqual({ done: 1, now: 2 });
    expect(saiBeadsAt(12)).toEqual({ done: 6, now: 7 });
  });

  it("marks all seven beads done at the end", () => {
    expect(saiBeadsAt(13)).toEqual({ done: 7, now: null });
  });
});
