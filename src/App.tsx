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
import { CHECK, IHRAM_CHECK, SAI_CHECK, type Question } from "./content/check";
import { IHRAM } from "./content/ihram";
import { SAI, saiBeadsAt } from "./content/sai";
import { TAHALLUL } from "./content/tahallul";
import { TAWAF, beadsAt, type Step } from "./content/tawaf";
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

// Each rite has its walk, the label of its progress, and what the gold button opens on its last step: its check (D58, D84, D103).
// Tahallul has no check, and its last step opens ihram step 1 again (D110, D112).
// Each check has its own words for the header and the scene text before the pick. Ihram and tahallul have no beads (D97).
// The panel names the next part: a quiet button on the last step, and the gold button on the result of the check (D107, D111).
type CheckWords = { progress: keyof Words; done: keyof Words; where: keyof Words };
type Walk = {
  steps: Record<Language, Step[]>;
  beadsAt: ((step: number) => { done: number; now: number | null }) | null;
  progress: keyof Words;
  after: { hash: string; label: keyof Words };
  panel: { hash: string; label: keyof Words } | null;
  check: { questions: Record<Language, Question[]>; words: CheckWords } | null;
};
const WALKS: Record<Rite, Walk> = {
  ihram: {
    steps: IHRAM,
    beadsAt: null,
    progress: "ihramProgress",
    after: { hash: CHECK_HASH.ihram, label: "checkStart" },
    panel: { hash: stepHash("tawaf", 1), label: "goTawaf" },
    check: { questions: IHRAM_CHECK, words: { progress: "ihramCheckProgress", done: "ihramCheckDone", where: "ihramCheckWhere" } },
  },
  tawaf: {
    steps: TAWAF,
    beadsAt,
    progress: "progress",
    after: { hash: CHECK_HASH.tawaf, label: "checkStart" },
    panel: { hash: stepHash("sai", 1), label: "goSai" },
    check: { questions: CHECK, words: { progress: "checkProgress", done: "checkDone", where: "checkWhere" } },
  },
  sai: {
    steps: SAI,
    beadsAt: saiBeadsAt,
    progress: "saiProgress",
    after: { hash: CHECK_HASH.sai, label: "checkStart" },
    panel: { hash: stepHash("tahallul", 1), label: "goTahallul" },
    check: { questions: SAI_CHECK, words: { progress: "saiCheckProgress", done: "saiCheckDone", where: "saiCheckWhere" } },
  },
  tahallul: {
    steps: TAHALLUL,
    beadsAt: null,
    progress: "tahallulProgress",
    after: { hash: stepHash("ihram", 1), label: "umrahAgain" },
    panel: null,
    check: null,
  },
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
  const beads = walk.beadsAt?.(step);
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
  // In the check, Next waits for a pick (D52), and on the result it opens the next part (D107).
  // On the last step of a walk, Next opens the check of its rite (D58, D84, D103).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const forward = event.key === "ArrowRight" || event.key === "PageDown";
      const backward = event.key === "ArrowLeft" || event.key === "PageUp";
      if (check) {
        if (!forward) return;
        if (told) nextQuestion();
        else if (at === "result" && walk.panel) location.hash = walk.panel.hash;
      } else if (forward) {
        if (step < total) goTo(rite, step + 1);
        else location.hash = walk.after.hash;
      } else if (backward) {
        if (step > 1) goTo(rite, step - 1);
      } else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rite, step, total, check, told, at, walk]);

  const chooseLanguage = (next: Language) => {
    storeLanguage(next);
    setLanguage(next);
  };

  // The camera of a question is the camera of its walk step, and the result shows the camera of the last step (D115).
  const checked = check ? walk.check : null;
  const questions = checked ? checked.questions[language] : [];
  const sceneStep = !checked ? step : at === "result" ? total : questions[at - 1].step;
  // Before the pick, the text for a screen reader names no place, as the names hide on screen (D57).
  const names = !checked || at === "result" || told;
  const where = names || !checked ? walk.steps[language][sceneStep - 1].where : words[checked.words.where];
  const notices = (
    <>
      {scene === "unsupported" && <MessageCard message={words.no3d} />}
      <Notice>{words.noticeReview}</Notice>
      <Notice>{words.noticeLayout}</Notice>
    </>
  );

  // The beads count the circuits of tawaf and the walks of sa'i.
  const beadWords = rite === "sai" ? { one: words.walk, none: words.noWalk, all: words.allWalks } : { one: words.circuit, none: words.noCircuit, all: words.allCircuits };
  const counted = !beads ? "" : beads.now ? beadWords.one.replace("{n}", String(beads.now)) : beads.done === 7 ? beadWords.all : beadWords.none;
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
            { id: "ihram", name: words.riteIhram },
            { id: "tawaf", name: words.riteTawaf },
            { id: "sai", name: words.riteSai },
            { id: "tahallul", name: words.riteTahallul },
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
          {checked ? (
            <CheckSide
              words={words}
              header={{ progress: words[checked.words.progress], done: words[checked.words.done] }}
              questions={questions}
              steps={walk.steps[language]}
              at={at}
              picks={picks}
              onPick={(answer) => setPicks((before) => before.map((pick, index) => (index === (at as number) - 1 ? answer : pick)))}
              onNext={nextQuestion}
              onLeave={() => goTo(rite, total)}
              // "Cuba semula" in the panel goes away with the result, so the first answer takes the focus.
              onAgain={() => {
                restart();
                setMoved(true);
              }}
              onStep={(question) => goTo(rite, question)}
              onward={walk.panel ? { label: words[walk.panel.label], onAct: () => (location.hash = walk.panel!.hash) } : undefined}
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
                  label: words[walk.progress].replace("{n}", String(step)).replace("{total}", String(total)),
                  beads: beads && <Beads done={beads.done} now={beads.now} label={counted} />,
                }}
              >
                {now.recitation && <ArabicBlock {...now.recitation} />}
                {now.note && <Note label={words.noteLabel} text={now.note} />}
                {last && walk.panel && (
                  <button type="button" className="vh-button vh-button--quiet walk__again" onClick={() => (location.hash = walk.panel!.hash)}>
                    {words[walk.panel.label]}
                  </button>
                )}
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
                  !last ? { label: words.next, onAct: () => goTo(rite, step + 1) } : { label: words[walk.after.label], onAct: () => (location.hash = walk.after.hash) }
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
