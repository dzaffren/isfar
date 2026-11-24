import { describe, expect, it } from "vitest";
import { CHECK } from "../content/check";
import { missedSteps, score } from "./check";

const questions = CHECK.ms;
const allRight = questions.map((question) => question.right);
const wrongAt = (...numbers: number[]) => allRight.map((right, index) => (numbers.includes(index + 1) ? (right + 1) % 3 : right));

describe("score", () => {
  it("counts the right picks", () => {
    expect(score(allRight, questions)).toBe(7);
    expect(score(wrongAt(5), questions)).toBe(6);
    expect(score(wrongAt(1, 2, 6), questions)).toBe(4);
  });
});

describe("missedSteps", () => {
  it("gives no step when each pick is right", () => {
    expect(missedSteps(allRight, questions)).toEqual([]);
  });

  it("gives the walk step of each missed question", () => {
    expect(missedSteps(wrongAt(5), questions)).toEqual([6]);
  });

  it("gives step 3 once when questions 1 and 2 are both missed", () => {
    expect(missedSteps(wrongAt(1, 2, 6), questions)).toEqual([3, 7]);
  });
});
