import { describe, expect, it } from "vitest";
import { CHECK } from "./check";

const words = (text: string) => text.split(/\s+/).length;

describe("the questions of the check", () => {
  it("has seven questions in each language, each with three answers", () => {
    for (const questions of [CHECK.ms, CHECK.en]) {
      expect(questions).toHaveLength(7);
      for (const question of questions) expect(question.answers).toHaveLength(3);
    }
  });

  it("shows the same walk step and the same right answer in each language", () => {
    expect(CHECK.en.map((question) => question.step)).toEqual(CHECK.ms.map((question) => question.step));
    expect(CHECK.en.map((question) => question.right)).toEqual(CHECK.ms.map((question) => question.right));
  });

  it("comes in the order of the walk", () => {
    expect(CHECK.ms.map((question) => question.step)).toEqual([3, 3, 4, 5, 6, 7, 14]);
  });

  it("never puts the right answer in the same place on two questions in a row", () => {
    CHECK.ms.slice(1).forEach((question, index) => expect(question.right).not.toBe(CHECK.ms[index].right));
  });

  it("keeps each question and each line why to 40 words or fewer", () => {
    for (const question of [...CHECK.ms, ...CHECK.en]) {
      expect(words(question.ask), question.ask).toBeLessThanOrEqual(40);
      expect(words(question.why), question.ask).toBeLessThanOrEqual(40);
    }
  });

  it("names the answers of the scenarios", () => {
    expect(CHECK.ms[0].answers[CHECK.ms[0].right]).toBe("Sejajar dengan penjuru Hajar Aswad");
    expect(CHECK.ms[2].answers[0]).toBe("Di sebelah kanan");
    expect(CHECK.ms[2].answers[CHECK.ms[2].right]).toBe("Di sebelah kiri");
    expect(CHECK.ms[2].why).toBe("Kaabah sentiasa di sebelah kiri anda sepanjang tawaf.");
  });
});
