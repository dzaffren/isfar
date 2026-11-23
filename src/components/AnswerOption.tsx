import type { Ref } from "react";

export type Mark = "rest" | "right" | "wrong";

type Props = { text: string; mark: Mark; picked: boolean; locked: boolean; onPick: () => void; ref?: Ref<HTMLButtonElement> };

const TICK = <path d="M5 12.5l4.5 4.5L19 7.5" />;
const CROSS = (
  <>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </>
);

// One answer of a check question. After an answer, the right one shows a tick, and a wrong pick shows a cross.
export function AnswerOption({ text, mark, picked, locked, onPick, ref }: Props) {
  const tone = mark === "right" ? " vh-option--right" : mark === "wrong" ? " vh-option--wrong" : "";
  return (
    <button ref={ref} type="button" className={`vh-option${tone}`} aria-pressed={picked} aria-disabled={locked} onClick={locked ? undefined : onPick}>
      <span className="vh-option__mark" aria-hidden="true">
        {mark !== "rest" && (
          <svg width={mark === "right" ? 16 : 20} height={mark === "right" ? 16 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {mark === "right" ? TICK : CROSS}
          </svg>
        )}
      </span>
      {text}
    </button>
  );
}
