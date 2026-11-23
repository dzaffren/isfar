import type { ReactNode } from "react";
import type { Question } from "../content/check";
import type { Step } from "../content/tawaf";
import type { Words } from "../content/text";
import { missedSteps, score, type Picks } from "../lib/check";
import { Beads } from "./Beads";
import { CheckQuestion } from "./CheckQuestion";
import { CheckResult } from "./CheckResult";
import { StepActions } from "./StepActions";
import { StepPanel } from "./StepPanel";

type Props = {
  words: Words;
  questions: Question[];
  steps: Step[];
  at: number | "result";
  picks: Picks;
  onPick: (answer: number) => void;
  onNext: () => void;
  onLeave: () => void;
  onAgain: () => void;
  onStep: (step: number) => void;
  children: ReactNode;
};

// The step panel and the bar of the check. The children sit between them: the message card and the notices.
export function CheckSide({ words, questions, steps, at, picks, onPick, onNext, onLeave, onAgain, onStep, children }: Props) {
  const total = questions.length;
  const leave = { label: words.checkLeave, onAct: onLeave };

  if (at === "result") {
    const missed = missedSteps(picks, questions).map((step) => ({
      step,
      label: words.checkStep.replace("{n}", String(step)).replace("{title}", steps[step - 1].title),
    }));
    return (
      <>
        <StepPanel step={total + 1} progress={{ label: words.checkDone, beads: <Beads done={7} now={null} label={words.checkDone} /> }}>
          <CheckResult
            score={words.checkScore.replace("{n}", String(score(picks, questions))).replace("{total}", String(total))}
            all={words.checkAll}
            missedLabel={words.checkMissed}
            missed={missed}
            onStep={onStep}
          />
        </StepPanel>
        {children}
        <StepActions back={leave} next={{ label: words.checkAgain, onAct: onAgain }} />
      </>
    );
  }

  const count = (text: string) => text.replace("{n}", String(at)).replace("{total}", String(total));
  return (
    <>
      <StepPanel step={at} progress={{ label: count(words.checkProgress), beads: <Beads done={at - 1} now={at} label={count(words.checkQuestion)} /> }}>
        <CheckQuestion
          question={questions[at - 1]}
          picked={picks[at - 1]}
          rightWord={words.checkRight}
          wrongWord={words.checkWrong}
          focusFirst={at > 1}
          onPick={onPick}
        />
      </StepPanel>
      {children}
      <StepActions back={leave} next={{ label: words.next, onAct: onNext, off: picks[at - 1] === null }} />
    </>
  );
}
