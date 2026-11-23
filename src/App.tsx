import { useCallback, useEffect, useState } from "react";
import { ArabicBlock } from "./components/ArabicBlock";
import { Beads } from "./components/Beads";
import { CheckSide } from "./components/CheckSide";
import { MessageCard } from "./components/MessageCard";
import { Note } from "./components/Note";
import { Notice } from "./components/Notice";
import { StepActions } from "./components/StepActions";
import { StepPanel } from "./components/StepPanel";
import { TopBar } from "./components/TopBar";
import { CHECK } from "./content/check";
import { TAWAF, beadsAt } from "./content/tawaf";
import { TEXT } from "./content/text";
import type { Picks } from "./lib/check";
import { pickLanguage, readStoredLanguage, storeLanguage, type Language } from "./lib/language";
import { CHECK_HASH, isCheck, readStep, stepHash } from "./lib/step";
import { Scene, type SceneState } from "./scene/Scene";

const TOTAL = TAWAF.ms.length;
const QUESTIONS = CHECK.ms.length;
const NO_PICKS: Picks = Array(QUESTIONS).fill(null);

// Each step change goes through the address, so a reload, a link and the Back button of the browser keep the step (D30).
const goTo = (step: number) => {
  location.hash = stepHash(step);
};

export function App() {
  const [language, setLanguage] = useState<Language>(() => pickLanguage(readStoredLanguage(), navigator.language));
  const [step, setStep] = useState(() => readStep(location.hash, TOTAL));
  const [check, setCheck] = useState(() => isCheck(location.hash));
  // The question and the picks live only in the open page, so a reload starts the check again (D53).
  const [at, setAt] = useState<number | "result">(1);
  const [picks, setPicks] = useState<Picks>(NO_PICKS);
  // A move through the address swaps the side column, so the new screen takes the focus that the old one held.
  const [moved, setMoved] = useState(false);
  const [scene, setScene] = useState<SceneState>("loading");
  const onScene = useCallback((state: SceneState) => setScene(state), []);
  const words = TEXT[language];
  const now = TAWAF[language][step - 1];
  const beads = beadsAt(step);
  const last = step === TOTAL;
  const told = typeof at === "number" && picks[at - 1] !== null;
  document.documentElement.lang = language;

  const restart = () => {
    setAt(1);
    setPicks(NO_PICKS);
  };
  const nextQuestion = () => setAt((question) => (question === QUESTIONS ? "result" : typeof question === "number" ? question + 1 : question));

  useEffect(() => {
    const onHash = () => {
      setStep(readStep(location.hash, TOTAL));
      const inCheck = isCheck(location.hash);
      setCheck(inCheck);
      setMoved(true);
      if (inCheck) restart();
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // The arrow keys and a presenter clicker, which sends Page Up and Page Down (D31).
  // In the check, Next waits for a pick (D52). On step 15, Next opens the check (D58).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const forward = event.key === "ArrowRight" || event.key === "PageDown";
      const backward = event.key === "ArrowLeft" || event.key === "PageUp";
      if (check) {
        if (!forward) return;
        if (told) nextQuestion();
      } else if (forward) {
        if (step < TOTAL) goTo(step + 1);
        else location.hash = CHECK_HASH;
      } else if (backward) {
        if (step > 1) goTo(step - 1);
      } else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, check, told]);

  const chooseLanguage = (next: Language) => {
    storeLanguage(next);
    setLanguage(next);
  };

  // The camera of a question is the camera of its walk step, and the result shows the wide view of step 15.
  const questions = CHECK[language];
  const sceneStep = !check ? step : at === "result" ? TOTAL : questions[at - 1].step;
  // Before the pick, the text for a screen reader names no place, as the names hide on screen (D57).
  const names = !check || at === "result" || told;
  const where = names ? TAWAF[language][sceneStep - 1].where : words.checkWhere;
  const notices = (
    <>
      {scene === "unsupported" && <MessageCard message={words.no3d} />}
      <Notice>{words.noticeReview}</Notice>
      <Notice>{words.noticeLayout}</Notice>
    </>
  );

  const circuits = beads.now ? words.circuit.replace("{n}", String(beads.now)) : beads.done === 7 ? words.allCircuits : words.noCircuit;
  return (
    <div className="app">
      <TopBar siteName={words.siteName} switchLabel={words.languageSwitch} language={language} onLanguage={chooseLanguage} />
      <main className="app__main">
        <Scene step={sceneStep} names={names} words={words} where={where} state={scene} onState={onScene} />
        <div className="app__side">
          {scene === "failed" && <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />}
          {check ? (
            <CheckSide
              words={words}
              questions={questions}
              steps={TAWAF[language]}
              at={at}
              picks={picks}
              onPick={(answer) => setPicks((before) => before.map((pick, index) => (index === (at as number) - 1 ? answer : pick)))}
              onNext={nextQuestion}
              onLeave={() => goTo(TOTAL)}
              onAgain={restart}
              onStep={goTo}
              focusFirst={moved}
            >
              {notices}
            </CheckSide>
          ) : (
            <>
              <StepPanel
                title={now.title}
                text={now.text}
                step={step}
                progress={{
                  label: words.progress.replace("{n}", String(step)).replace("{total}", String(TOTAL)),
                  beads: <Beads done={beads.done} now={beads.now} label={circuits} />,
                }}
              >
                {now.recitation && <ArabicBlock {...now.recitation} />}
                {now.note && <Note label={words.noteLabel} text={now.note} />}
                {last && (
                  <button type="button" className="vh-button vh-button--quiet walk__again" onClick={() => goTo(1)}>
                    {words.startAgain}
                  </button>
                )}
              </StepPanel>
              {notices}
              <StepActions
                back={step > 1 ? { label: words.back, onAct: () => goTo(step - 1) } : undefined}
                next={last ? { label: words.checkStart, onAct: () => (location.hash = CHECK_HASH) } : { label: words.next, onAct: () => goTo(step + 1) }}
                focusNext={moved}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
