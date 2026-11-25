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
import { CHECK, SAI_CHECK } from "./content/check";
import { SAI, saiBeadsAt } from "./content/sai";
import { TAWAF, beadsAt } from "./content/tawaf";
import { TEXT, type Words } from "./content/text";
import type { Picks } from "./lib/check";
import { pickLanguage, readStoredLanguage, storeLanguage, type Language } from "./lib/language";
import { CHECK_HASH, TOTAL, isCheck, readPlace, stepHash, type Rite } from "./lib/step";
import { Scene, type SceneState } from "./scene/Scene";

const QUESTIONS = CHECK.ms.length;
const NO_PICKS: Picks = Array(QUESTIONS).fill(null);

// Each step change and each rite change goes through the address, so a reload, a link and the Back button of the browser keep the step (D30).
const goTo = (rite: Rite, step: number) => {
  location.hash = stepHash(rite, step);
};

// Each rite has its walk and its check. The check's own words are its header and the scene text before the pick.
type CheckWords = { progress: keyof Words; done: keyof Words; where: keyof Words };
const WALKS = {
  tawaf: { steps: TAWAF, beadsAt, check: CHECK, checkWords: { progress: "checkProgress", done: "checkDone", where: "checkWhere" } as CheckWords },
  sai: { steps: SAI, beadsAt: saiBeadsAt, check: SAI_CHECK, checkWords: { progress: "saiCheckProgress", done: "saiCheckDone", where: "saiCheckWhere" } as CheckWords },
};

export function App() {
  const [language, setLanguage] = useState<Language>(() => pickLanguage(readStoredLanguage(), navigator.language));
  const [{ rite, step }, setPlace] = useState(() => readPlace(location.hash));
  const [check, setCheck] = useState(() => isCheck(location.hash));
  // The question and the picks live only in the open page, so a reload starts the check again (D53).
  const [at, setAt] = useState<number | "result">(1);
  const [picks, setPicks] = useState<Picks>(NO_PICKS);
  // A move through the address swaps the side column, so the new screen takes the focus that the old one held.
  const [moved, setMoved] = useState(false);
  const [scene, setScene] = useState<SceneState>("loading");
  const onScene = useCallback((state: SceneState) => setScene(state), []);
  const words = TEXT[language];
  const walk = WALKS[rite];
  const total = TOTAL[rite];
  const now = walk.steps[language][step - 1];
  const beads = walk.beadsAt(step);
  const last = step === total;
  const told = typeof at === "number" && picks[at - 1] !== null;
  document.documentElement.lang = language;

  const restart = () => {
    setAt(1);
    setPicks(NO_PICKS);
  };
  const nextQuestion = () => setAt((question) => (question === QUESTIONS ? "result" : typeof question === "number" ? question + 1 : question));

  useEffect(() => {
    const onHash = () => {
      setPlace(readPlace(location.hash));
      const inCheck = isCheck(location.hash);
      setCheck(inCheck);
      setMoved(true);
      if (inCheck) restart();
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // The arrow keys and a presenter clicker, which sends Page Up and Page Down (D31).
  // In the check, Next waits for a pick (D52). On the last step of a walk, Next opens the check of that rite (D58, D84).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const forward = event.key === "ArrowRight" || event.key === "PageDown";
      const backward = event.key === "ArrowLeft" || event.key === "PageUp";
      if (check) {
        if (!forward) return;
        if (told) nextQuestion();
      } else if (forward) {
        if (step < total) goTo(rite, step + 1);
        else location.hash = CHECK_HASH[rite];
      } else if (backward) {
        if (step > 1) goTo(rite, step - 1);
      } else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rite, step, total, check, told]);

  const chooseLanguage = (next: Language) => {
    storeLanguage(next);
    setLanguage(next);
  };

  // The camera of a question is the camera of its walk step, and the result shows the wide view of the last step.
  const questions = walk.check[language];
  const sceneStep = !check ? step : at === "result" ? total : questions[at - 1].step;
  // Before the pick, the text for a screen reader names no place, as the names hide on screen (D57).
  const names = !check || at === "result" || told;
  const where = names ? walk.steps[language][sceneStep - 1].where : words[walk.checkWords.where];
  const notices = (
    <>
      {scene === "unsupported" && <MessageCard message={words.no3d} />}
      <Notice>{words.noticeReview}</Notice>
      <Notice>{words.noticeLayout}</Notice>
    </>
  );

  // The address of a check reads as its rite: #semak as tawaf, #semak-sai as sa'i.
  const sai = rite === "sai";
  const beadWords = sai ? { one: words.walk, none: words.noWalk, all: words.allWalks } : { one: words.circuit, none: words.noCircuit, all: words.allCircuits };
  const counted = beads.now ? beadWords.one.replace("{n}", String(beads.now)) : beads.done === 7 ? beadWords.all : beadWords.none;
  return (
    <div className="app">
      <TopBar
        siteName={words.siteName}
        switchLabel={words.languageSwitch}
        language={language}
        onLanguage={chooseLanguage}
        rite={{
          label: words.riteSwitch,
          parts: [
            { id: "tawaf", name: words.riteTawaf },
            { id: "sai", name: words.riteSai },
          ],
          now: rite,
          // The other rite opens at its step 1 (D71).
          onRite: (other) => (other !== rite ? goTo(other, 1) : undefined),
        }}
      />
      <main className="app__main">
        <Scene key={rite} rite={rite} step={sceneStep} names={names} words={words} where={where} state={scene} onState={onScene} />
        <div className="app__side">
          {scene === "failed" && <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />}
          {check ? (
            <CheckSide
              words={words}
              header={{ progress: words[walk.checkWords.progress], done: words[walk.checkWords.done] }}
              questions={questions}
              steps={walk.steps[language]}
              at={at}
              picks={picks}
              onPick={(answer) => setPicks((before) => before.map((pick, index) => (index === (at as number) - 1 ? answer : pick)))}
              onNext={nextQuestion}
              onLeave={() => goTo(rite, total)}
              onAgain={restart}
              onStep={(question) => goTo(rite, question)}
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
                  label: (sai ? words.saiProgress : words.progress).replace("{n}", String(step)).replace("{total}", String(total)),
                  beads: <Beads done={beads.done} now={beads.now} label={counted} />,
                }}
              >
                {now.recitation && <ArabicBlock {...now.recitation} />}
                {now.note && <Note label={words.noteLabel} text={now.note} />}
                {last && (
                  <button type="button" className="vh-button vh-button--quiet walk__again" onClick={() => goTo(rite, 1)}>
                    {words.startAgain}
                  </button>
                )}
              </StepPanel>
              {notices}
              <StepActions
                back={step > 1 ? { label: words.back, onAct: () => goTo(rite, step - 1) } : undefined}
                next={
                  !last ? { label: words.next, onAct: () => goTo(rite, step + 1) } : { label: words.checkStart, onAct: () => (location.hash = CHECK_HASH[rite]) }
                }
                focusNext={moved}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
