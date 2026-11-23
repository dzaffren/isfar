import { useEffect, useRef } from "react";
import { LoadingCard } from "../components/LoadingCard";
import { MatafMap } from "../components/MatafMap";
import type { Words } from "../content/text";

export type SceneState = "loading" | "shown" | "unsupported" | "failed";

type Props = { step: number; words: Words; where: string; state: SceneState; onState: (state: SceneState) => void };

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
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canDraw3D()) {
      onState("unsupported");
      return;
    }
    let stop: (() => void) | undefined;
    let cancelled = false;
    import("./place")
      .then(({ showPlace }) =>
        showPlace(canvas.current!, { onShown: () => onState("shown"), onLost: () => onState("failed") }),
      )
      .then((stopPlace) => {
        if (cancelled) stopPlace();
        else stop = stopPlace;
      })
      .catch(() => {
        if (!cancelled) onState("failed");
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [onState]);

  const still = state === "unsupported" || state === "failed";
  return (
    <section className="scene" data-scene data-state={state} aria-busy={state === "loading"}>
      <div className="scene__frame vh-marble">
        {still && <MatafMap step={step} words={words} label={`${words.map}. ${where}`} />}
        <canvas ref={canvas} className="scene__view scene__canvas" role="img" aria-label={where} hidden={still} />
        {state === "loading" && <LoadingCard title={words.loadingTitle} hint={words.loadingHint} />}
      </div>
    </section>
  );
}
