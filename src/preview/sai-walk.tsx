import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../docs/design/design-system/styles.css";
import "../app.css";
import "./preview.css";
import { ArabicBlock } from "../components/ArabicBlock";
import { Beads } from "../components/Beads";
import { LoadingCard } from "../components/LoadingCard";
import { MasaMap } from "../components/MasaMap";
import { MessageCard } from "../components/MessageCard";
import { Note } from "../components/Note";
import { Notice } from "../components/Notice";
import { StepActions } from "../components/StepActions";
import { StepPanel } from "../components/StepPanel";
import { TopBar } from "../components/TopBar";
import { SAI, saiBeadsAt } from "../content/sai";
import { TEXT } from "../content/text";
import type { Language } from "../lib/language";

// The preview of the sai-walk v2 spec, pause 2: the two lanes of the mas'a. With no "step" in the address it lists each state in a frame.
// With a "step" it shows one working sa'i screen from the real components. The top-view map stands in for the 3D mas'a.
const params = new URLSearchParams(location.search);
const TOTAL = 13;

function Screen() {
  const [language, setLanguage] = useState<Language>(params.get("lang") === "en" ? "en" : "ms");
  const [step, setStep] = useState(Number(params.get("step")));
  const scene = params.get("scene") ?? "map";
  const words = TEXT[language];
  const now = SAI[language][step - 1];
  const beads = saiBeadsAt(step);
  const last = step === TOTAL;

  useEffect(() => {
    document.documentElement.lang = language;
    const theme = params.get("theme");
    if (theme) document.documentElement.dataset.theme = theme;
  }, [language]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") setStep((at) => Math.min(TOTAL, at + 1));
      else if (event.key === "ArrowLeft" || event.key === "PageUp") setStep((at) => Math.max(1, at - 1));
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const walks = beads.now ? words.walk.replace("{n}", String(beads.now)) : beads.done === 7 ? words.allWalks : words.noWalk;
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
        <section className="scene" data-scene data-state={scene}>
          <div className="scene__frame vh-marble">
            {scene !== "loading" && <MasaMap step={step} words={words} label={`${words.masaMap}. ${now.where}`} />}
            {scene === "loading" && <LoadingCard title={words.loadingMasa} hint={words.loadingHint} />}
          </div>
        </section>
        <div className="app__side">
          {scene === "failed" && <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />}
          <StepPanel
            title={now.title}
            text={now.text}
            step={step}
            progress={{
              label: words.saiProgress.replace("{n}", String(step)).replace("{total}", String(TOTAL)),
              beads: <Beads done={beads.done} now={beads.now} label={walks} />,
            }}
          >
            {now.recitation && <ArabicBlock {...now.recitation} />}
            {now.note && <Note label={words.noteLabel} text={now.note} open={params.get("note") === "open"} />}
          </StepPanel>
          {scene === "map" && <MessageCard message={words.no3d} />}
          <Notice>{words.noticeReview}</Notice>
          <Notice>{words.noticeLayout}</Notice>
          <StepActions
            back={step > 1 ? { label: words.back, onAct: () => setStep(step - 1) } : undefined}
            next={last ? { label: words.startAgain, onAct: () => setStep(1) } : { label: words.next, onAct: () => setStep(step + 1) }}
          />
        </div>
      </main>
    </div>
  );
}

const PHONE = { width: 360, height: 800 };
const LAPTOP = { width: 1280, height: 720 };

const FRAMES = [
  { title: "Step 1. The two lanes and the barrier, no path line", query: "step=1", size: PHONE },
  { title: "Step 4. Walk 1 in the lane to Marwah, and the new line", query: "step=4", size: PHONE },
  { title: "Step 5. The marker in the lane to Marwah, between the green lights", query: "step=5", size: PHONE },
  { title: "Step 6. Marwah, walk 1 ends", query: "step=6", size: PHONE },
  { title: "Step 7. The turn at Marwah into the lane to Safa, and the new line", query: "step=7", size: PHONE },
  { title: "Step 8. Walk 3, the lane to Marwah again", query: "step=8", size: PHONE },
  { title: "Step 4, English, dark", query: "step=4&lang=en&theme=dark", size: PHONE },
  { title: "Step 7, English, dark", query: "step=7&lang=en&theme=dark", size: PHONE },
  { title: "Laptop, 1280x720. Step 4", query: "step=4", size: LAPTOP },
];

function Index() {
  return (
    <main className="preview">
      <div className="preview__intro">
        <h1 className="vh-title">Sa'i walk v2, pause 2</h1>
        <p className="vh-text">
          Each frame is one sa'i step with the two lanes, built from the real components. The top-view map stands in for the 3D mas'a, which /build makes from the same plan.
          Each frame works: press Seterusnya, or the Right and Left arrow keys.
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

createRoot(document.getElementById("root")!).render(params.has("step") ? <Screen /> : <Index />);
