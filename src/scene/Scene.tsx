import { useEffect, useRef } from "react";
import { LoadingCard } from "../components/LoadingCard";
import { MatafMap, PART_WORD } from "../components/MatafMap";
import type { Words } from "../content/text";
import { PARTS, type Part } from "./mataf";
import type { Name, Place } from "./place";

export type SceneState = "loading" | "shown" | "unsupported" | "failed";

type Props = { step: number; words: Words; where: string; state: SceneState; onState: (state: SceneState) => void };

const PART_LIST = Object.keys(PARTS) as Part[];

function canDraw3D(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

export function Scene({ step, words, where, state, onState }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const names = useRef<Partial<Record<Part, HTMLSpanElement>>>({});
  const leads = useRef<Partial<Record<Part, SVGLineElement>>>({});
  const place = useRef<Place | null>(null);
  const stepNow = useRef(step);
  stepNow.current = step;

  // The place loads once. A step change or a language change does not load it again.
  useEffect(() => {
    if (!canDraw3D()) {
      onState("unsupported");
      return;
    }
    let cancelled = false;
    const parts = Object.fromEntries(PART_LIST.map((part) => [part, { name: names.current[part]!, lead: leads.current[part]! }])) as Record<Part, Name>;
    import("./place")
      .then(({ showPlace }) =>
        showPlace(canvas.current!, {
          step: stepNow.current,
          names: parts,
          onShown: () => onState("shown"),
          onLost: () => onState("failed"),
          // The browser test reads where the camera is, and whether it moves.
          onCamera: (at) => section.current?.setAttribute("data-camera", String(at)),
          onMoving: (moving) => section.current?.setAttribute("data-moving", String(moving)),
        }),
      )
      .then((shown) => {
        if (cancelled) return shown.stop();
        place.current = shown;
        shown.goTo(stepNow.current);
      })
      .catch(() => {
        if (!cancelled) onState("failed");
      });
    return () => {
      cancelled = true;
      place.current?.stop();
      place.current = null;
    };
  }, [onState]);

  useEffect(() => {
    place.current?.goTo(step);
  }, [step]);

  const still = state === "unsupported" || state === "failed";
  return (
    <section ref={section} className="scene" data-scene data-state={state} aria-busy={state === "loading"}>
      <div className="scene__frame vh-marble">
        {still && <MatafMap step={step} words={words} label={`${words.map}. ${where}`} />}
        <canvas ref={canvas} className="scene__view scene__canvas" role="img" aria-label={where} hidden={still} />
        <div className="scene__names" aria-hidden="true" hidden={state !== "shown"}>
          <svg className="scene__view">
            {PART_LIST.map((part) => (
              <line key={part} ref={(line) => void (leads.current[part] = line ?? undefined)} className="scene__lead" />
            ))}
          </svg>
          {PART_LIST.map((part) => (
            <span key={part} ref={(name) => void (names.current[part] = name ?? undefined)} className="scene__name" hidden>
              {words[PART_WORD[part]]}
            </span>
          ))}
        </div>
        {state === "loading" && <LoadingCard title={words.loadingTitle} hint={words.loadingHint} />}
      </div>
    </section>
  );
}
