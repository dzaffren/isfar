import type { Question } from "../content/check";
import { AnswerOption, type Mark } from "./AnswerOption";

type Props = { question: Question; picked: number | null; rightWord: string; wrongWord: string; onPick: (answer: number) => void };

// A check question and its three answers. The answer locks on the first tap, and one line says why (D49).
export function CheckQuestion({ question, picked, rightWord, wrongWord, onPick }: Props) {
  const told = picked !== null;
  const markOf = (answer: number): Mark => (!told ? "rest" : answer === question.right ? "right" : answer === picked ? "wrong" : "rest");
  const right = picked === question.right;
  return (
    <>
      <h1 className="vh-question">{question.ask}</h1>
      <div className="check__answers">
        {question.answers.map((text, answer) => (
          <AnswerOption key={answer} text={text} mark={markOf(answer)} picked={picked === answer} locked={told} onPick={() => onPick(answer)} />
        ))}
      </div>
      {/* The live region is on the page before the answer, so a screen reader reads the line when it fills. */}
      <p className={right ? "vh-result" : "vh-result vh-result--wrong"} aria-live="polite">
        {told && (
          <>
            {right ? rightWord : wrongWord} <span className="check__why">{question.why}</span>
          </>
        )}
      </p>
    </>
  );
}
