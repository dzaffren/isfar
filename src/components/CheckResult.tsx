type Missed = { step: number; label: string };

type Props = { score: string; all: string; missedLabel: string; missed: Missed[]; onStep: (step: number) => void };

// The end of the check: a plain count, and each missed step with a way back to it (D50). Nothing is kept.
export function CheckResult({ score, all, missedLabel, missed, onStep }: Props) {
  return (
    <>
      <h1 className="vh-title">{score}</h1>
      {missed.length === 0 ? (
        <p className="vh-text">{all}</p>
      ) : (
        <>
          <p className="vh-text">{missedLabel}</p>
          <ul className="check__missed">
            {missed.map(({ step, label }) => (
              <li key={step}>
                <button type="button" className="vh-button vh-button--quiet" onClick={() => onStep(step)}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
