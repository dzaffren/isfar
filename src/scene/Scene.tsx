import { useEffect, useRef } from "react";
import { BirAliMap, IHRAM_PART_WORD } from "../components/BirAliMap";
import { LoadingCard } from "../components/LoadingCard";
import { MasaMap, SAI_PART_WORD } from "../components/MasaMap";
import { MatafMap, PART_WORD } from "../components/MatafMap";
import type { Words } from "../content/text";
import type { Rite } from "../lib/step";
import { IHRAM_PARTS } from "./birali";
import { SAI_PARTS, TAHALLUL_SPOTS } from "./masa";
import { PARTS } from "./mataf";
import type { Name, Place } from "./place";

export type SceneState = "loading" | "shown" | "unsupported" | "failed";

type Props = { rite: Rite; step: number; names?: boolean; words: Words; where: string; state: SceneState; onState: (state: SceneState) => void };

// The names of the parts of each place, and the word on screen for each. Tahallul is in the mas'a (D117).
const PART_WORDS: Record<Rite, Record<string, keyof Words>> = { ihram: IHRAM_PART_WORD, tawaf: PART_WORD, sai: SAI_PART_WORD, tahallul: SAI_PART_WORD };
const PART_LISTS: Record<Rite, string[]> = {
  ihram: Object.keys(IHRAM_PARTS),
  tawaf: Object.keys(PARTS),
  sai: Object.keys(SAI_PARTS),
  tahallul: Object.keys(SAI_PARTS),
};

const LOADING: Record<Rite, keyof Words> = { ihram: "loadingBirAli", tawaf: "loadingTitle", sai: "loadingMasa", tahallul: "loadingMasa" };

function canDraw3D(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

// App.tsx keys the scene by the rite, so a rite change starts it again with the place of that rite (D77).
export function Scene({ rite, step, names: namesOn = true, words, where, state, onState }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const names = useRef<Partial<Record<string, HTMLSpanElement>>>({});
  const leads = useRef<Partial<Record<string, SVGLineElement>>>({});
  const partList = PART_LISTS[rite];
  const place = useRef<Place | null>(null);
  const stepNow = useRef(step);
  stepNow.current = step;
  const namesNow = useRef(namesOn);
  namesNow.current = namesOn;

  // The place loads once for its rite. A step change or a language change does not load it again.
  useEffect(() => {
    if (!canDraw3D()) {
      onState("unsupported");
      return;
    }
    onState("loading");
    let cancelled = false;
    const parts: Record<string, Name> = Object.fromEntries(partList.map((part) => [part, { name: names.current[part]!, lead: leads.current[part]! }]));
    import("./place")
      .then(({ showPlace }) =>
        showPlace(canvas.current!, {
          rite,
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
        shown.setNames(namesNow.current);
      })
      .catch(() => {
        if (!cancelled) onState("failed");
      });
    return () => {
      cancelled = true;
      place.current?.stop();
      place.current = null;
    };
  }, [onState, rite, partList]);

  useEffect(() => {
    place.current?.goTo(step);
  }, [step]);

  // The check hides the names until the person answers, because a name can give the answer away (D57).
  useEffect(() => {
    place.current?.setNames(namesOn);
  }, [namesOn]);

  const still = state === "unsupported" || state === "failed";
  return (
    <section ref={section} className="scene" data-scene data-state={state} aria-busy={state === "loading"}>
      <div className="scene__frame vh-marble">
        {still && rite === "tawaf" && <MatafMap step={step} words={words} label={`${words.map}. ${where}`} showNames={namesOn} />}
        {still && rite === "sai" && <MasaMap step={step} words={words} label={`${words.masaMap}. ${where}`} showNames={namesOn} />}
        {still && rite === "tahallul" && <MasaMap step={step} words={words} label={`${words.masaMap}. ${where}`} spots={TAHALLUL_SPOTS} />}
        {still && rite === "ihram" && <BirAliMap step={step} words={words} label={`${words.birAliMap}. ${where}`} showNames={namesOn} />}
        <canvas ref={canvas} className="scene__view scene__canvas" role="img" aria-label={where} hidden={still} />
        <div className="scene__names" aria-hidden="true" hidden={state !== "shown"}>
          <svg className="scene__view">
            {partList.map((part) => (
              <line key={part} ref={(line) => void (leads.current[part] = line ?? undefined)} className="scene__lead" />
            ))}
          </svg>
          {partList.map((part) => (
            <span key={part} ref={(name) => void (names.current[part] = name ?? undefined)} className="scene__name" hidden>
              {words[PART_WORDS[rite][part]]}
            </span>
          ))}
        </div>
        {state === "loading" && <LoadingCard title={words[LOADING[rite]]} hint={words.loadingHint} />}
      </div>
    </section>
  );
}
