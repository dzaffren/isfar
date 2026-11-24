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

// The preview of the sai-walk spec, pause 2. With no "step" in the address it lists each state in a frame.
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
const ZOOMED = { width: 960, height: 540 };
const LAPTOP = { width: 1280, height: 720 };

const FRAMES = [
  { title: "Step 1. The mas'a and its parts, and the rite switch", query: "step=1", size: PHONE },
  { title: "Step 2. The note, open", query: "step=2&note=open", size: PHONE },
  { title: "Step 3. Safa, with Innas-safa", query: "step=3", size: PHONE },
  { title: "Step 4. Towards Marwah, bead 1, the path line", query: "step=4", size: PHONE },
  { title: "Step 5. Between the green lights, with Rabbighfir", query: "step=5", size: PHONE },
  { title: "Step 6. Marwah, walk 1 ends", query: "step=6", size: PHONE },
  { title: "Step 7. Walk 2, back to Safa", query: "step=7", size: PHONE },
  { title: "Step 13. Sa'i is complete, Mula semula", query: "step=13", size: PHONE },
  { title: "Step 5, English, dark", query: "step=5&lang=en&theme=dark", size: PHONE },
  { title: "Step 1, dark", query: "step=1&theme=dark", size: PHONE },
  { title: "Failed download, step 5. The map and Cuba lagi", query: "step=5&scene=failed", size: PHONE },
  { title: "The 3D mas'a loads, step 1", query: "step=1&scene=loading", size: PHONE },
  { title: "Projector at 200% zoom, 960x540. Step 5, English", query: "step=5&lang=en", size: ZOOMED },
  { title: "Laptop, 1280x720. Step 1", query: "step=1", size: LAPTOP },
  { title: "Laptop, 1280x720. Step 10, walk 5", query: "step=10", size: LAPTOP },
];

function Index() {
  return (
    <main className="preview">
      <div className="preview__intro">
        <h1 className="vh-title">Sa'i walk, pause 2</h1>
        <p className="vh-text">
          Each frame is one state of the sa'i walk, built from the real components. The top-view map of the mas'a stands in for the 3D mas'a, which /build makes.
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
