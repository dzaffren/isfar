import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "../../docs/design/design-system/styles.css";
import "../app.css";
import "./preview.css";
import { Beads } from "../components/Beads";
import { CheckQuestion } from "../components/CheckQuestion";
import { CheckResult } from "../components/CheckResult";
import { LoadingCard } from "../components/LoadingCard";
import { MatafMap } from "../components/MatafMap";
import { MessageCard } from "../components/MessageCard";
import { Notice } from "../components/Notice";
import { StepActions } from "../components/StepActions";
import { StepPanel } from "../components/StepPanel";
import { TopBar } from "../components/TopBar";
import { CHECK } from "../content/check";
import { TAWAF } from "../content/tawaf";
import { TEXT } from "../content/text";
import type { Language } from "../lib/language";
import { Scene, type SceneState } from "../scene/Scene";

// The preview of the tawaf-check spec, pause 2. With no "at" in the address it lists each state in a frame.
// With an "at" it shows one working screen from the real components: "walk" is step 15 of the walk, a number is a question, "result" is the end.
const params = new URLSearchParams(location.search);
const TOTAL = 7;

// Picks for a frame that opens part-way: each earlier question right, except the ones in "missed".
function startPicks(at: number): (number | null)[] {
  const missed = (params.get("missed") ?? "").split(",").filter(Boolean).map(Number);
  const pickHere = params.get("pick");
  return CHECK.ms.map((question, index) => {
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
  const entry = params.get("entry") ?? "a";
  const words = TEXT[language];
  const questions = CHECK[language];
  const steps = TAWAF[language];

  useEffect(() => {
    document.documentElement.lang = language;
    const theme = params.get("theme");
    if (theme) document.documentElement.dataset.theme = theme;
  }, [language]);

  const begin = () => {
    setPicks(Array(TOTAL).fill(null));
    setAt(1);
  };

  // The camera of a question is the camera of its walk step. The result shows the wide view of step 15.
  const view = at === "walk" || at === "result" ? 15 : questions[at - 1].step;
  const told = typeof at === "number" && picks[at - 1] !== null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "PageDown") return;
      event.preventDefault();
      if (at === "walk" && entry === "a") begin();
      else if (typeof at === "number" && told) setAt(at === TOTAL ? "result" : at + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, told, entry]);

  const score = picks.filter((pick, index) => pick === questions[index].right).length;
  const missedSteps = [...new Set(questions.filter((question, index) => picks[index] !== question.right).map((question) => question.step))];
  const where = at === "walk" || at === "result" ? steps[14].where : steps[questions[at - 1].step - 1].where;

  let header: string;
  let beads = <></>;
  let body: ReactNode;
  let actions: ReactNode;
  if (at === "walk") {
    header = words.progress.replace("{n}", "15").replace("{total}", "15");
    beads = <Beads done={7} now={null} label={words.allCircuits} />;
    body = (
      <>
        <h1 className="vh-title">{steps[14].title}</h1>
        <p className="vh-text">{steps[14].text}</p>
        {entry === "a" ? (
          <button type="button" className="vh-button vh-button--quiet check__again">
            {words.startAgain}
          </button>
        ) : (
          <button type="button" className="vh-button check__again" onClick={begin}>
            {words.checkStart}
          </button>
        )}
      </>
    );
    actions = (
      <StepActions
        back={{ label: words.back, onAct: () => undefined }}
        next={entry === "a" ? { label: words.checkStart, onAct: begin } : { label: words.startAgain, onAct: () => undefined }}
      />
    );
  } else if (at === "result") {
    header = words.checkDone;
    beads = <Beads done={7} now={null} label={words.checkDone} />;
    body = (
      <CheckResult
        score={words.checkScore.replace("{n}", String(score)).replace("{total}", String(TOTAL))}
        all={words.checkAll}
        missedLabel={words.checkMissed}
        missed={missedSteps.map((step) => ({ step, label: words.checkStep.replace("{n}", String(step)).replace("{title}", steps[step - 1].title) }))}
        onStep={() => setAt("walk")}
      />
    );
    actions = <StepActions back={{ label: words.checkLeave, onAct: () => setAt("walk") }} next={{ label: words.checkAgain, onAct: begin }} />;
  } else {
    header = words.checkProgress.replace("{n}", String(at)).replace("{total}", String(TOTAL));
    beads = <Beads done={at - 1} now={at} label={words.checkQuestion.replace("{n}", String(at)).replace("{total}", String(TOTAL))} />;
    body = (
      <CheckQuestion
        question={questions[at - 1]}
        picked={picks[at - 1]}
        rightWord={words.checkRight}
        wrongWord={words.checkWrong}
        onPick={(answer) => setPicks((now) => now.map((pick, index) => (index === at - 1 ? answer : pick)))}
      />
    );
    actions = (
      <StepActions
        back={{ label: words.checkLeave, onAct: () => setAt("walk") }}
        next={{ label: words.next, onAct: () => setAt(at === TOTAL ? "result" : at + 1), off: !told }}
        focusNext={params.get("focus") === "next"}
      />
    );
  }

  const still = scene === "map" || scene === "failed";
  return (
    <div className="app">
      <TopBar siteName={words.siteName} switchLabel={words.languageSwitch} language={language} onLanguage={setLanguage} />
      <main className="app__main">
        {scene === "3d" ? (
          <Scene step={view} words={words} where={where} state={live} onState={onLive} />
        ) : (
          <section className="scene" data-scene data-state={scene}>
            <div className="scene__frame vh-marble">
              {still && <MatafMap step={view} words={words} label={`${words.map}. ${where}`} showNames={at === "walk" || at === "result" || told} />}
              {scene === "loading" && <LoadingCard title={words.loadingTitle} hint={words.loadingHint} />}
            </div>
          </section>
        )}
        <div className="app__side">
          {scene === "failed" && <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />}
          <StepPanel step={typeof at === "number" ? at : at === "result" ? 99 : 15} progress={{ label: header, beads }}>
            {body}
          </StepPanel>
          {scene === "map" && <MessageCard message={words.no3d} />}
          <Notice>{words.noticeReview}</Notice>
          <Notice>{words.noticeLayout}</Notice>
          {actions}
        </div>
      </main>
    </div>
  );
}

const PHONE = { width: 360, height: 800 };
const ZOOMED = { width: 960, height: 540 };
const LAPTOP = { width: 1280, height: 720 };

const FRAMES = [
  { title: "Step 15, entry A. Mula semakan takes the Next place, Mula semula moves to the panel", query: "at=walk&entry=a", size: PHONE },
  { title: "Step 15, entry B. Mula semakan in the panel, Mula semula stays in the bar", query: "at=walk&entry=b", size: PHONE },
  { title: "Question 1. No answer yet: names hidden, Seterusnya off", query: "at=1", size: PHONE },
  { title: "Question 1. A right answer", query: "at=1&pick=1", size: PHONE },
  { title: "Question 3. A wrong answer, and the right one marked", query: "at=3&pick=0", size: PHONE },
  { title: "Question 2. The longest answer", query: "at=2", size: PHONE },
  { title: "Question 6, English. Answered right", query: "at=6&pick=2&lang=en", size: PHONE },
  { title: "Question 5, dark. A wrong answer", query: "at=5&pick=0&theme=dark", size: PHONE },
  { title: "Question 4. Keyboard focus on Seterusnya", query: "at=4&pick=0&focus=next", size: PHONE },
  { title: "Result. 6 of 7, one step to go over", query: "at=result&missed=5", size: PHONE },
  { title: "Result. 4 of 7, three steps to go over", query: "at=result&missed=1,2,6", size: PHONE },
  { title: "Result. 7 of 7", query: "at=result", size: PHONE },
  { title: "Result, dark, English", query: "at=result&missed=3&theme=dark&lang=en", size: PHONE },
  { title: "Failed download, question 4. The map and Cuba lagi", query: "at=4&scene=failed", size: PHONE },
  { title: "The 3D place loads, question 1", query: "at=1&scene=loading", size: PHONE },
  { title: "Projector at 200% zoom, 960x540. Question 3, English, answered", query: "at=3&pick=2&lang=en", size: ZOOMED },
  { title: "960x540. Result with two steps to go over", query: "at=result&missed=4,7", size: ZOOMED },
  { title: "Laptop, 1280x720. Question 7", query: "at=7", size: LAPTOP },
];

function Index() {
  return (
    <main className="preview">
      <div className="preview__intro">
        <h1 className="vh-title">Tawaf check, pause 2</h1>
        <p className="vh-text">
          Each frame is one state of the check, built from the real components. The frames show the top-view map in place of the 3D place, so that the
          page does not open 18 3D views at once. Each frame works: tap an answer, then Seterusnya, or press the Right arrow key.
        </p>
        <p className="vh-text">
          <a href="?at=1&scene=3d">Open question 1 with the real 3D place</a>. Open it in Firefox on this machine. The names of the parts still show in 3D
          here, and /build hides them until the answer.
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
