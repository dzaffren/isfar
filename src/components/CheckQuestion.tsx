import { useEffect, useRef } from "react";
import type { Question } from "../content/check";
import { AnswerOption, type Mark } from "./AnswerOption";

type Props = { question: Question; picked: number | null; rightWord: string; wrongWord: string; focusFirst: boolean; onPick: (answer: number) => void };

// A check question and its three answers. The answer locks on the first tap, and one line says why (D49).
export function CheckQuestion({ question, picked, rightWord, wrongWord, focusFirst, onPick }: Props) {
  const told = picked !== null;
  const first = useRef<HTMLButtonElement>(null);
  const line = useRef<HTMLParagraphElement>(null);

  // A new question takes the focus from the off Next button, so the next control is the first answer.
  useEffect(() => {
    if (focusFirst) first.current?.focus();
  }, [focusFirst]);

  // On a phone the line why can sit under the bar, so it moves to the centre once the person taps.
  useEffect(() => {
    if (!told) return;
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    line.current?.scrollIntoView({ block: "center", behavior: instant ? "instant" : "smooth" });
  }, [told]);

  const markOf = (answer: number): Mark => (!told ? "rest" : answer === question.right ? "right" : answer === picked ? "wrong" : "rest");
  const right = picked === question.right;
  return (
    <>
      <h1 className="vh-question">{question.ask}</h1>
      <div className="check__answers">
        {question.answers.map((text, answer) => (
          <AnswerOption key={answer} ref={answer === 0 ? first : undefined} text={text} mark={markOf(answer)} picked={picked === answer} locked={told} onPick={() => onPick(answer)} />
        ))}
      </div>
      {/* The live region is on the page before the answer, so a screen reader reads the line when it fills. */}
      <p ref={line} className={right ? "vh-result" : "vh-result vh-result--wrong"} aria-live="polite">
        {told && (
          <>
            {right ? rightWord : wrongWord} <span className="check__why">{question.why}</span>
          </>
        )}
      </p>
    </>
  );
}
