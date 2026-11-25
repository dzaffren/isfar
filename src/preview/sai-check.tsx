import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../docs/design/design-system/styles.css";
import "../app.css";
import "./preview.css";
import { Beads } from "../components/Beads";
import { CheckSide } from "../components/CheckSide";
import { LoadingCard } from "../components/LoadingCard";
import { MasaMap } from "../components/MasaMap";
import { MessageCard } from "../components/MessageCard";
import { Notice } from "../components/Notice";
import { StepActions } from "../components/StepActions";
import { StepPanel } from "../components/StepPanel";
import { TopBar } from "../components/TopBar";
import { SAI_CHECK } from "../content/check";
import { SAI } from "../content/sai";
import { TEXT } from "../content/text";
import type { Language } from "../lib/language";
import type { Picks } from "../lib/check";
import { Scene, type SceneState } from "../scene/Scene";

// The preview of the sai-check spec, pause 2. With no "at" in the address it lists each state in a frame.
// With an "at" it shows one working screen from the real components: "walk" is sa'i step 13, a number is a question, "result" is the end.
const params = new URLSearchParams(location.search);
const TOTAL = 7;
const LAST = 13;

// Picks for a frame that opens part-way: each earlier question right, except the ones in "missed".
function startPicks(at: number): Picks {
  const missed = (params.get("missed") ?? "").split(",").filter(Boolean).map(Number);
  const pickHere = params.get("pick");
  return SAI_CHECK.ms.map((question, index) => {
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
  const plain = TEXT[language];
  // The sa'i check names its rite in the header. Every other word is the word of the tawaf check.
  const words = { ...plain, checkProgress: plain.saiCheckProgress, checkDone: plain.saiCheckDone };
  const questions = SAI_CHECK[language];
  const steps = SAI[language];

  useEffect(() => {
    document.documentElement.lang = language;
    const theme = params.get("theme");
    if (theme) document.documentElement.dataset.theme = theme;
  }, [language]);

  const begin = () => {
    setPicks(Array(TOTAL).fill(null));
    setAt(1);
  };

  // The camera of a question is the camera of its walk step. The result shows the wide view of step 13.
  const view = at === "walk" || at === "result" ? LAST : questions[at - 1].step;
  const told = typeof at === "number" && picks[at - 1] !== null;
  const names = at === "walk" || at === "result" || told;
  const where = names ? steps[view - 1].where : words.saiCheckWhere;
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
        rite={{ label: words.riteSwitch, tawaf: words.riteTawaf, sai: words.riteSai, now: "sai", onRite: () => undefined }}
      />
      <main className="app__main">
        {scene === "3d" ? (
          <Scene rite="sai" step={view} names={names} words={words} where={where} state={live} onState={onLive} />
        ) : (
          <section className="scene" data-scene data-state={scene}>
            <div className="scene__frame vh-marble">
              {still && <MasaMap step={view} words={words} label={`${words.masaMap}. ${where}`} showNames={names} />}
              {scene === "loading" && <LoadingCard title={words.loadingMasa} hint={words.loadingHint} />}
            </div>
          </section>
        )}
        <div className="app__side">
          {scene === "failed" && <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />}
          {at === "walk" ? (
            <>
              <StepPanel
                title={steps[LAST - 1].title}
                text={steps[LAST - 1].text}
                step={LAST}
                progress={{
                  label: words.saiProgress.replace("{n}", String(LAST)).replace("{total}", String(LAST)),
                  beads: <Beads done={7} now={null} label={words.allWalks} />,
                }}
              >
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
  { title: "Sa'i step 13. Mula semakan takes the Next place, Mula semula moves to the panel", query: "at=walk", size: PHONE },
  { title: "Question 1. No answer yet: names hidden, Seterusnya off", query: "at=1", size: PHONE },
  { title: "Question 1. A right answer, and Bukit Safa shows", query: "at=1&pick=1", size: PHONE },
  { title: "Question 2. The longest answer", query: "at=2", size: PHONE },
  { title: "Question 3. The lane to Marwah, answered right", query: "at=3&pick=2", size: PHONE },
  { title: "Question 6. A wrong count, and the right one marked", query: "at=6&pick=0", size: PHONE },
  { title: "Question 5, English. Answered right", query: "at=5&pick=1&lang=en", size: PHONE },
  { title: "Question 4, dark. A wrong answer", query: "at=4&pick=2&theme=dark", size: PHONE },
  { title: "Result. 6 of 7, one step to go over", query: "at=result&missed=6", size: PHONE },
  { title: "Result. 5 of 7, questions 4 and 5 give one step", query: "at=result&missed=4,5", size: PHONE },
  { title: "Result. 7 of 7", query: "at=result", size: PHONE },
  { title: "Result, dark, English", query: "at=result&missed=3&theme=dark&lang=en", size: PHONE },
  { title: "Failed download, question 7. The map and Cuba lagi", query: "at=7&scene=failed", size: PHONE },
  { title: "The mas'a loads, question 1", query: "at=1&scene=loading", size: PHONE },
  { title: "Projector at 200% zoom, 960x540. Question 6, English, answered", query: "at=6&pick=2&lang=en", size: ZOOMED },
  { title: "Laptop, 1280x720. Question 7", query: "at=7", size: LAPTOP },
];

function Index() {
  return (
    <main className="preview">
      <div className="preview__intro">
        <h1 className="vh-title">Sa'i check, pause 2</h1>
        <p className="vh-text">
          Each frame is one state of the sa'i check, built from the real components. The frames show the top-view map of the mas'a in place of the 3D
          mas'a, so that the page does not open 16 3D views at once. Each frame works: tap an answer, then Seterusnya, or press the Right arrow key.
        </p>
        <p className="vh-text">
          <a href="?at=1&scene=3d">Open question 1 with the real 3D mas'a</a>. Open it in Firefox on this machine.
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
