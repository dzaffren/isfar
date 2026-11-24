import type { Question } from "../content/check";

// The picks of the check live only in the open page (D53). Each pick is the index of an answer, or null before the tap.
export type Picks = (number | null)[];

export function score(picks: Picks, questions: Question[]): number {
  return questions.filter((question, index) => picks[index] === question.right).length;
}

// The walk step of each missed question, once each, in walk order. Questions 1 and 2 share step 3.
export function missedSteps(picks: Picks, questions: Question[]): number[] {
  return [...new Set(questions.filter((question, index) => picks[index] !== question.right).map((question) => question.step))];
}
