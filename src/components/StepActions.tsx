type Action = { label: string; onAct: () => void };
type Props = { back?: Action; next: Action; focusNext?: boolean };

// Back and Next. The bar stays at the bottom edge of the screen, where a thumb reaches it.
export function StepActions({ back, next, focusNext }: Props) {
  return (
    <div className="walk__actions vh-marble">
      <div className="vh-panel__actions">
        {back ? (
          <button type="button" className="vh-button vh-button--quiet" onClick={back.onAct}>
            {back.label}
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="vh-button" onClick={next.onAct} autoFocus={focusNext}>
          {next.label}
        </button>
      </div>
    </div>
  );
}
