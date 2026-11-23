import { useCallback, useEffect, useState } from "react";
import { ArabicBlock } from "./components/ArabicBlock";
import { Beads } from "./components/Beads";
import { MessageCard } from "./components/MessageCard";
import { Note } from "./components/Note";
import { Notice } from "./components/Notice";
import { StepActions } from "./components/StepActions";
import { StepPanel } from "./components/StepPanel";
import { TopBar } from "./components/TopBar";
import { TAWAF, beadsAt } from "./content/tawaf";
import { TEXT } from "./content/text";
import { pickLanguage, readStoredLanguage, storeLanguage, type Language } from "./lib/language";
import { readStep, stepHash } from "./lib/step";
import { Scene, type SceneState } from "./scene/Scene";

const TOTAL = TAWAF.ms.length;

// Each step change goes through the address, so a reload, a link and the Back button of the browser keep the step (D30).
const goTo = (step: number) => {
  location.hash = stepHash(step);
};

export function App() {
  const [language, setLanguage] = useState<Language>(() => pickLanguage(readStoredLanguage(), navigator.language));
  const [step, setStep] = useState(() => readStep(location.hash, TOTAL));
  const [scene, setScene] = useState<SceneState>("loading");
  const onScene = useCallback((state: SceneState) => setScene(state), []);
  const words = TEXT[language];
  const now = TAWAF[language][step - 1];
  const beads = beadsAt(step);
  const last = step === TOTAL;
  document.documentElement.lang = language;

  useEffect(() => {
    const onHash = () => setStep(readStep(location.hash, TOTAL));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // The arrow keys and a presenter clicker, which sends Page Up and Page Down (D31).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        if (step < TOTAL) goTo(step + 1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        if (step > 1) goTo(step - 1);
      } else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const chooseLanguage = (next: Language) => {
    storeLanguage(next);
    setLanguage(next);
  };

  const circuits = beads.now ? words.circuit.replace("{n}", String(beads.now)) : beads.done === 7 ? words.allCircuits : words.noCircuit;
  return (
    <div className="app">
      <TopBar siteName={words.siteName} switchLabel={words.languageSwitch} language={language} onLanguage={chooseLanguage} />
      <main className="app__main">
        <Scene step={step} words={words} where={now.where} state={scene} onState={onScene} />
        <div className="app__side">
          {scene === "failed" && <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />}
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
          </StepPanel>
          {scene === "unsupported" && <MessageCard message={words.no3d} />}
          <Notice>{words.noticeReview}</Notice>
          <Notice>{words.noticeLayout}</Notice>
          <StepActions
            back={step > 1 ? { label: words.back, onAct: () => goTo(step - 1) } : undefined}
            next={last ? { label: words.startAgain, onAct: () => goTo(1) } : { label: words.next, onAct: () => goTo(step + 1) }}
          />
        </div>
      </main>
    </div>
  );
}
