import type { ReactNode } from "react";

type Props = {
  title?: string;
  text?: string;
  progress?: { label: string; beads: ReactNode };
  step?: number;
  children?: ReactNode;
};

export function StepPanel({ title, text, progress, step, children }: Props) {
  return (
    <article className="vh-panel vh-cloth">
      {progress && (
        <header className="vh-panel__head vh-kiswah">
          <div className="vh-panel__progress">
            <div className="vh-panel__where">{progress.label}</div>
            {progress.beads}
          </div>
        </header>
      )}
      <div key={step} className={step === undefined ? "vh-panel__body" : "vh-panel__body walk__step"} aria-live={step === undefined ? undefined : "polite"}>
        {title && <h1 className="vh-title">{title}</h1>}
        {text && <p className="vh-text">{text}</p>}
        {children}
      </div>
    </article>
  );
}
