import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../docs/design/design-system/styles.css";
import "../app.css";
import "./preview.css";
import { Beads } from "../components/Beads";
import { BirAliMap } from "../components/BirAliMap";
import { CheckSide } from "../components/CheckSide";
import { MasaMap } from "../components/MasaMap";
import { MatafMap } from "../components/MatafMap";
import { MessageCard } from "../components/MessageCard";
import { Note } from "../components/Note";
import { Notice } from "../components/Notice";
import { StepActions } from "../components/StepActions";
import { StepPanel } from "../components/StepPanel";
import { TopBar } from "../components/TopBar";
import { CHECK, IHRAM_CHECK, SAI_CHECK, type Question } from "../content/check";
import { IHRAM } from "../content/ihram";
import { SAI, saiBeadsAt } from "../content/sai";
import { TAHALLUL } from "../content/tahallul";
import { TAWAF, beadsAt, type Step } from "../content/tawaf";
import { TEXT, type Words } from "../content/text";
import type { Language } from "../lib/language";
import type { Picks } from "../lib/check";
import { TAHALLUL_SPOTS } from "../scene/masa";
import { Scene, type SceneState } from "../scene/Scene";

// The preview of the full-umrah spec, pause 2. With no "at" in the address it lists each screen in a frame.
// With an "at" it shows one screen from the real components: "tawaf-16" is a walk step, "tawaf-result" is the result of a check.
const params = new URLSearchParams(location.search);

type Part = "ihram" | "tawaf" | "sai" | "tahallul";
const ORDER: Part[] = ["ihram", "tawaf", "sai", "tahallul"];

type Walk = {
  steps: Record<Language, Step[]>;
  progress: keyof Words;
  beadsAt: ((step: number) => { done: number; now: number | null }) | null;
  check: { questions: Record<Language, Question[]>; progress: keyof Words; done: keyof Words } | null;
  onward: keyof Words | null;
};

const WALKS: Record<Part, Walk> = {
  ihram: { steps: IHRAM, progress: "ihramProgress", beadsAt: null, check: { questions: IHRAM_CHECK, progress: "ihramCheckProgress", done: "ihramCheckDone" }, onward: "goTawaf" },
  tawaf: { steps: TAWAF, progress: "progress", beadsAt, check: { questions: CHECK, progress: "checkProgress", done: "checkDone" }, onward: "goSai" },
  sai: { steps: SAI, progress: "saiProgress", beadsAt: saiBeadsAt, check: { questions: SAI_CHECK, progress: "saiCheckProgress", done: "saiCheckDone" }, onward: "goTahallul" },
  tahallul: { steps: TAHALLUL, progress: "tahallulProgress", beadsAt: null, check: null, onward: null },
};

type At = { part: Part; step: number | "result" };

function readAt(text: string): At {
  const [part, step] = text.split("-") as [Part, string];
  return { part, step: step === "result" ? "result" : Number(step) };
}

// Picks for a result: each question right, except the ones in "missed".
function resultPicks(questions: Question[]): Picks {
  const missed = (params.get("missed") ?? "").split(",").filter(Boolean).map(Number);
  return questions.map((question, index) => (missed.includes(index + 1) ? (question.right + 1) % 3 : question.right));
}

function Screen() {
  const [language, setLanguage] = useState<Language>(params.get("lang") === "en" ? "en" : "ms");
  const [{ part, step }, setAt] = useState<At>(() => readAt(params.get("at")!));
  const [live, setLive] = useState<SceneState>("loading");
  const onLive = useCallback((state: SceneState) => setLive(state), []);
  const scene = params.get("scene") ?? "map";
  const words = TEXT[language];
  const walk = WALKS[part];
  const steps = walk.steps[language];
  const total = steps.length;
  const next = ORDER[ORDER.indexOf(part) + 1];

  useEffect(() => {
    document.documentElement.lang = language;
    const theme = params.get("theme");
    if (theme) document.documentElement.dataset.theme = theme;
  }, [language]);

  const view = step === "result" ? total : step;
  const where = steps[view - 1].where;
  const notices = (
    <>
      {scene === "map" && <MessageCard message={words.no3d} />}
      <Notice>{words.noticeReview}</Notice>
      <Notice>{words.noticeLayout}</Notice>
    </>
  );

  const onward = next && walk.onward ? { label: words[walk.onward], onAct: () => setAt({ part: next, step: 1 }) } : undefined;
  const now = step === "result" ? null : steps[step - 1];
  const beads = typeof step === "number" ? walk.beadsAt?.(step) : undefined;
  const last = step === total;
  // On the last step: the check in the gold place, and the next part as a quiet button (D107, D111). Tahallul ends with the umrah again (D110).
  const gold = !last
    ? { label: words.next, onAct: () => setAt({ part, step: (step as number) + 1 }) }
    : walk.check
      ? { label: words.checkStart, onAct: () => setAt({ part, step: "result" }) }
      : { label: words.umrahAgain, onAct: () => setAt({ part: "ihram", step: 1 }) };

  return (
    <div className="app">
      <TopBar
        siteName={words.siteName}
        switchLabel={words.languageSwitch}
        language={language}
        onLanguage={setLanguage}
        rite={{
          label: words.riteSwitch,
          parts: [
            { id: "ihram", name: words.riteIhram },
            { id: "tawaf", name: words.riteTawaf },
            { id: "sai", name: words.riteSai },
            { id: "tahallul", name: words.riteTahallul },
          ],
          now: part,
          onRite: (other) => setAt({ part: other, step: 1 }),
        }}
      />
      <main className="app__main">
        {scene === "3d" && part === "tawaf" ? (
          <Scene rite="tawaf" step={view} words={words} where={where} state={live} onState={onLive} />
        ) : (
          <section className="scene" data-scene data-state="unsupported">
            <div className="scene__frame vh-marble">
              {part === "tawaf" && <MatafMap step={view} words={words} label={`${words.map}. ${where}`} />}
              {part === "sai" && <MasaMap step={view} words={words} label={`${words.masaMap}. ${where}`} />}
              {part === "tahallul" && <MasaMap step={view} words={words} label={`${words.masaMap}. ${where}`} spots={TAHALLUL_SPOTS} />}
              {part === "ihram" && <BirAliMap step={view} words={words} label={`${words.birAliMap}. ${where}`} />}
            </div>
          </section>
        )}
        <div className="app__side">
          {step === "result" && walk.check ? (
            <CheckSide
              words={words}
              header={{ progress: words[walk.check.progress], done: words[walk.check.done] }}
              questions={walk.check.questions[language]}
              steps={steps}
              at="result"
              picks={resultPicks(walk.check.questions[language])}
              onPick={() => undefined}
              onNext={() => undefined}
              onLeave={() => setAt({ part, step: total })}
              onAgain={() => undefined}
              onStep={(missed) => setAt({ part, step: missed })}
              onward={onward}
              focusFirst={false}
            >
              {notices}
            </CheckSide>
          ) : (
            now && (
              <>
                <StepPanel
                  title={now.title}
                  text={now.text}
                  step={step as number}
                  progress={{
                    label: words[walk.progress].replace("{n}", String(step)).replace("{total}", String(total)),
                    beads: beads && <Beads done={beads.done} now={beads.now} label={part === "sai" ? words.allWalks : words.allCircuits} />,
                  }}
                >
                  {now.note && <Note label={words.noteLabel} text={now.note} />}
                  {last && onward && (
                    <button type="button" className="vh-button vh-button--quiet walk__again" onClick={onward.onAct}>
                      {onward.label}
                    </button>
                  )}
                  {last && (
                    <button type="button" className="vh-button vh-button--quiet walk__again" onClick={() => setAt({ part, step: 1 })}>
                      {words.startAgain}
                    </button>
                  )}
                </StepPanel>
                {notices}
                <StepActions back={step !== 1 ? { label: words.back, onAct: () => setAt({ part, step: (step as number) - 1 }) } : undefined} next={gold} />
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
}

const PHONE = { width: 360, height: 800 };
const ZOOMED = { width: 960, height: 540 };
const LAPTOP = { width: 1280, height: 720 };

const FRAMES = [
  { title: "Tawaf step 15. The new last line: the two rakaat and zamzam come next", query: "at=tawaf-15", size: PHONE },
  { title: "Tawaf step 16. Behind Maqam Ibrahim, the note on the schools, Teruskan ke sa'i in the panel", query: "at=tawaf-16", size: PHONE },
  { title: "Tawaf check result. Teruskan ke sa'i in gold, Cuba semula in the panel", query: "at=tawaf-result&missed=3", size: PHONE },
  { title: "Tawaf check result, 7 of 7", query: "at=tawaf-result", size: PHONE },
  { title: "Sa'i step 13. The new last line, Teruskan ke tahallul in the panel", query: "at=sai-13", size: PHONE },
  { title: "Sa'i check result. Teruskan ke tahallul in gold", query: "at=sai-result&missed=2", size: PHONE },
  { title: "Ihram check result. Teruskan ke tawaf in gold", query: "at=ihram-result", size: PHONE },
  { title: "Tahallul step 1. The marker past the Marwah exit, the note on the schools, four parts in the switch", query: "at=tahallul-1", size: PHONE },
  { title: "Tahallul step 2. Umrah selesai, and Mula semula umrah in gold", query: "at=tahallul-2", size: PHONE },
  { title: "Tahallul step 1, English, dark", query: "at=tahallul-1&lang=en&theme=dark", size: PHONE },
  { title: "Tawaf check result, English, dark", query: "at=tawaf-result&missed=3&lang=en&theme=dark", size: PHONE },
  { title: "Sa'i step 6, the map as today, with the exit drawn past Marwah", query: "at=sai-6", size: PHONE },
  { title: "Projector at 200% zoom, 960x540. Tahallul step 1, English", query: "at=tahallul-1&lang=en", size: ZOOMED },
  { title: "Laptop, 1280x720. Tawaf step 16", query: "at=tawaf-16", size: LAPTOP },
  { title: "Laptop, 1280x720. Sa'i check result", query: "at=sai-result&missed=2,5", size: LAPTOP },
];

function Index() {
  return (
    <main className="preview">
      <div className="preview__intro">
        <h1 className="vh-title">Full umrah, pause 2</h1>
        <p className="vh-text">
          Each frame is one screen of the join of the parts and of tahallul, built from the real components. The frames show the top-view maps in place
          of the 3D places, so that the page does not open 15 3D views at once. The buttons work: a gold button on a result opens the next part.
        </p>
        <p className="vh-text">
          <a href="?at=tawaf-16&scene=3d">Open tawaf step 16 with the real 3D mataf</a>. Open it in Firefox on this machine.
        </p>
      </div>
      <div className="preview__frames">
        {FRAMES.map(({ title, query, size }) => (
          <figure key={query + size.width} className="preview__frame">
            <figcaption>{title}</figcaption>
            <iframe title={title} src={`?${query}`} width={size.width} height={size.height} />
          </figure>
        ))}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(params.has("at") ? <Screen /> : <Index />);
