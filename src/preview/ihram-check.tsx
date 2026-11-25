import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../docs/design/design-system/styles.css";
import "../app.css";
import "./preview.css";
import { BirAliMap } from "../components/BirAliMap";
import { CheckSide } from "../components/CheckSide";
import { LoadingCard } from "../components/LoadingCard";
import { MessageCard } from "../components/MessageCard";
import { Note } from "../components/Note";
import { Notice } from "../components/Notice";
import { StepActions } from "../components/StepActions";
import { StepPanel } from "../components/StepPanel";
import { TopBar } from "../components/TopBar";
import { IHRAM_CHECK } from "../content/check";
import { IHRAM } from "../content/ihram";
import { TEXT } from "../content/text";
import type { Language } from "../lib/language";
import type { Picks } from "../lib/check";
import { Scene, type SceneState } from "../scene/Scene";

// The preview of the ihram-check spec, pause 2. With no "at" in the address it lists each state in a frame.
// With an "at" it shows one working screen from the real components: "walk" is ihram step 8, a number is a question, "result" is the end.
const params = new URLSearchParams(location.search);
const TOTAL = 7;
const LAST = 8;

// Picks for a frame that opens part-way: each earlier question right, except the ones in "missed".
function startPicks(at: number): Picks {
  const missed = (params.get("missed") ?? "").split(",").filter(Boolean).map(Number);
  const pickHere = params.get("pick");
  return IHRAM_CHECK.ms.map((question, index) => {
    const number = index + 1;
    if (number === at && pickHere !== null) return Number(pickHere);
    if (number >= at) return null;
    return missed.includes(number) ? (question.right + 1) % 3 : question.right;
  });
}

function Screen() {
  const first = params.get("at")!;
  const [language, setLanguage] = useState<Language>(params.get("lang") === "en" ? "en" : "ms");
  const [at, setAt] = useState<"walk" | "result" | number>(first === "walk" || first === "result" ? first : Number(first));
  const [picks, setPicks] = useState(() => startPicks(first === "result" ? TOTAL + 1 : Number(first)));
  const [live, setLive] = useState<SceneState>("loading");
  const onLive = useCallback((state: SceneState) => setLive(state), []);
  const scene = params.get("scene") ?? "map";
  const words = TEXT[language];
  const questions = IHRAM_CHECK[language];
  const steps = IHRAM[language];
  const last = steps[LAST - 1];

  useEffect(() => {
    document.documentElement.lang = language;
    const theme = params.get("theme");
    if (theme) document.documentElement.dataset.theme = theme;
  }, [language]);

  const begin = () => {
    setPicks(Array(TOTAL).fill(null));
    setAt(1);
  };

  // The camera of a question is the camera of its walk step. The result shows the wide view of step 8.
  const view = at === "walk" || at === "result" ? LAST : questions[at - 1].step;
  const told = typeof at === "number" && picks[at - 1] !== null;
  const names = at === "walk" || at === "result" || told;
  const where = names ? steps[view - 1].where : words.ihramCheckWhere;
  const next = () => setAt((now) => (now === TOTAL ? "result" : typeof now === "number" ? now + 1 : now));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "PageDown") return;
      event.preventDefault();
      if (at === "walk") begin();
      else if (told) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, told]);

  const notices = (
    <>
      {scene === "map" && <MessageCard message={words.no3d} />}
      <Notice>{words.noticeReview}</Notice>
      <Notice>{words.noticeLayout}</Notice>
    </>
  );

  const still = scene === "map" || scene === "failed";
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
          ],
          now: "ihram",
          onRite: () => undefined,
        }}
      />
      <main className="app__main">
        {scene === "3d" ? (
          <Scene rite="ihram" step={view} names={names} words={words} where={where} state={live} onState={onLive} />
        ) : (
          <section className="scene" data-scene data-state={scene}>
            <div className="scene__frame vh-marble">
              {still && <BirAliMap step={view} words={words} label={`${words.birAliMap}. ${where}`} showNames={names} />}
              {scene === "loading" && <LoadingCard title={words.loadingBirAli} hint={words.loadingHint} />}
            </div>
          </section>
        )}
        <div className="app__side">
          {scene === "failed" && <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />}
          {at === "walk" ? (
            <>
              <StepPanel
                title={last.title}
                text={last.text}
                step={LAST}
                progress={{ label: words.ihramProgress.replace("{n}", String(LAST)).replace("{total}", String(LAST)), beads: null }}
              >
                {last.note && <Note label={words.noteLabel} text={last.note} />}
                <button type="button" className="vh-button vh-button--quiet walk__again">
                  {words.goTawaf}
                </button>
                <button type="button" className="vh-button vh-button--quiet walk__again">
                  {words.startAgain}
                </button>
              </StepPanel>
              {notices}
              <StepActions back={{ label: words.back, onAct: () => undefined }} next={{ label: words.checkStart, onAct: begin }} />
            </>
          ) : (
            <CheckSide
              words={words}
              header={{ progress: words.ihramCheckProgress, done: words.ihramCheckDone }}
              questions={questions}
              steps={steps}
              at={at}
              picks={picks}
              onPick={(answer) => setPicks((before) => before.map((pick, index) => (index === (at as number) - 1 ? answer : pick)))}
              onNext={next}
              onLeave={() => setAt("walk")}
              onAgain={begin}
              onStep={() => setAt("walk")}
              focusFirst={false}
            >
              {notices}
            </CheckSide>
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
  { title: "Ihram step 8. Mula semakan takes the gold place, Teruskan ke tawaf and Mula semula sit in the panel", query: "at=walk", size: PHONE },
  { title: "Question 1. No answer yet: no names, Seterusnya off", query: "at=1", size: PHONE },
  { title: "Question 1. A right answer, and the four names show", query: "at=1&pick=1", size: PHONE },
  { title: "Question 2. Scent on the cloth, and the right answer marked", query: "at=2&pick=1", size: PHONE },
  { title: "Question 3. The longest answer", query: "at=3", size: PHONE },
  { title: "Question 5. The courtyard has no name, answered right", query: "at=5&pick=1", size: PHONE },
  { title: "Question 6, English. Answered right", query: "at=6&pick=2&lang=en", size: PHONE },
  { title: "Question 7, dark. A wrong answer", query: "at=7&pick=2&theme=dark", size: PHONE },
  { title: "Result. 6 of 7, one step to go over", query: "at=result&missed=2", size: PHONE },
  { title: "Result. 5 of 7, two steps", query: "at=result&missed=2,5", size: PHONE },
  { title: "Result. 7 of 7", query: "at=result", size: PHONE },
  { title: "Result, dark, English", query: "at=result&missed=3&theme=dark&lang=en", size: PHONE },
  { title: "Ihram step 8, dark, English", query: "at=walk&theme=dark&lang=en", size: PHONE },
  { title: "Failed download, question 4. The map and Cuba lagi", query: "at=4&scene=failed", size: PHONE },
  { title: "Bir Ali loads, question 1", query: "at=1&scene=loading", size: PHONE },
  { title: "Projector at 200% zoom, 960x540. Question 2, English, answered", query: "at=2&pick=0&lang=en", size: ZOOMED },
  { title: "Laptop, 1280x720. Ihram step 8", query: "at=walk", size: LAPTOP },
];

function Index() {
  return (
    <main className="preview">
      <div className="preview__intro">
        <h1 className="vh-title">Ihram check, pause 2</h1>
        <p className="vh-text">
          Each frame is one state of the ihram check, built from the real components. The frames show the top-view map of Bir Ali in place of the 3D
          Bir Ali, so that the page does not open 17 3D views at once. Each frame works: tap an answer, then Seterusnya, or press the Right arrow key.
        </p>
        <p className="vh-text">
          <a href="?at=1&scene=3d">Open question 1 with the real 3D Bir Ali</a>. Open it in Firefox on this machine.
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
