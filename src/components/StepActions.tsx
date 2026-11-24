import { useEffect, useRef } from "react";

type Action = { label: string; onAct: () => void; off?: boolean };
type Props = { back?: Action; next: Action; focusNext?: boolean };

// Back and Next. The bar stays at the bottom edge of the screen, where a thumb reaches it.
export function StepActions({ back, next, focusNext }: Props) {
  const bar = useRef<HTMLDivElement>(null);

  // A browser leaves a focused control where it is when part of it shows, so a control half under the bar stays hidden.
  // After the browser's own scroll, move the control clear of the bar. The side column scrolls in landscape, the page in portrait.
  useEffect(() => {
    let frame = 0;
    const onFocus = (event: FocusEvent) => {
      const control = event.target;
      if (!(control instanceof Element) || !bar.current || bar.current.contains(control)) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!bar.current) return;
        const under = control.getBoundingClientRect().bottom - bar.current.getBoundingClientRect().top;
        if (under <= 0) return;
        const side = bar.current.parentElement!;
        const scroller = getComputedStyle(side).overflowY === "auto" ? side : document.scrollingElement!;
        scroller.scrollBy({ top: under + 8 });
      });
    };
    document.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <div ref={bar} className="walk__actions vh-marble">
      <div className="vh-panel__actions">
        {back ? (
          <button type="button" className="vh-button vh-button--quiet" onClick={back.onAct}>
            {back.label}
          </button>
        ) : (
          <span />
        )}
        {/* An off button keeps the focus, so a keyboard person stays in the bar (D62). */}
        <button type="button" className="vh-button" onClick={next.off ? undefined : next.onAct} autoFocus={focusNext} aria-disabled={next.off || undefined}>
          {next.label}
        </button>
      </div>
    </div>
  );
}
