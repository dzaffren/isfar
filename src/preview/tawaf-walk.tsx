import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../docs/design/design-system/styles.css";
import "../app.css";
import "./preview.css";
import { ArabicBlock } from "../components/ArabicBlock";
import { Beads } from "../components/Beads";
import { LoadingCard } from "../components/LoadingCard";
import { MatafMap } from "../components/MatafMap";
import { MessageCard } from "../components/MessageCard";
import { Note } from "../components/Note";
import { Notice } from "../components/Notice";
import { StepActions } from "../components/StepActions";
import { StepPanel } from "../components/StepPanel";
import { TopBar } from "../components/TopBar";
import { TAWAF, beadsAt } from "../content/tawaf";
import { TEXT } from "../content/text";
import type { Language } from "../lib/language";
import { Standin } from "./Standin";

// The preview of the tawaf-walk spec, pause 2. With no "step" in the address it lists each state in a frame.
// With a "step" it shows one walk screen, built from the real components. The 3D place is a drawing here.
const params = new URLSearchParams(location.search);

function Walk() {
  const [language, setLanguage] = useState<Language>(params.get("lang") === "en" ? "en" : "ms");
  const [step, setStep] = useState(Number(params.get("step")));
  const scene = params.get("scene") ?? "shown";
  const words = TEXT[language];
  const steps = TAWAF[language];
  const now = steps[step - 1];
  const beads = beadsAt(step);
  const last = step === steps.length;

  useEffect(() => {
    document.documentElement.lang = language;
    const theme = params.get("theme");
    if (theme) document.documentElement.dataset.theme = theme;
  }, [language]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") setStep((at) => Math.min(at + 1, steps.length));
      else if (event.key === "ArrowLeft" || event.key === "PageUp") setStep((at) => Math.max(at - 1, 1));
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  const circuits = beads.now ? words.circuit.replace("{n}", String(beads.now)) : beads.done === 7 ? words.allCircuits : words.noCircuit;
  const still = scene === "map" || scene === "failed";
  return (
    <div className="app">
      <TopBar siteName={words.siteName} switchLabel={words.languageSwitch} language={language} onLanguage={setLanguage} />
      <main className="app__main">
        <section className="scene" data-scene data-state={scene}>
          <div className="scene__frame vh-marble">
            {still && <MatafMap step={step} words={words} label={`${words.map}. ${now.where}`} />}
            {scene === "shown" && <Standin step={step} words={words} label={now.where} />}
            {scene === "loading" && <LoadingCard title={words.loadingTitle} hint={words.loadingHint} />}
          </div>
        </section>
        <div className="app__side">
          {scene === "failed" && <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />}
          <StepPanel
            title={now.title}
            text={now.text}
            step={step}
            progress={{
              label: words.progress.replace("{n}", String(step)).replace("{total}", String(steps.length)),
              beads: <Beads done={beads.done} now={beads.now} label={circuits} />,
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
            focusNext={params.get("focus") === "next"}
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
  { title: "Step 1, phone. The place and its five names", query: "step=1", size: PHONE },
  { title: "Step 2. The note on other schools, open", query: "step=2&note=open", size: PHONE },
  { title: "Step 3. The start: guide line, green light, first recitation", query: "step=3", size: PHONE },
  { title: "Step 5. Outside Hijr Ismail, with a closed note", query: "step=5", size: PHONE },
  { title: "Step 7, English. The second recitation", query: "step=7&lang=en", size: PHONE },
  { title: "Step 9. Circuit 2: bead 1 is done, bead 2 is current", query: "step=9", size: PHONE },
  { title: "Step 15. Tawaf is complete, with Mula semula", query: "step=15", size: PHONE },
  { title: "Step 3, dark", query: "step=3&theme=dark", size: PHONE },
  { title: "Step 4. Keyboard focus on Seterusnya", query: "step=4&focus=next", size: PHONE },
  { title: "The 3D place loads", query: "step=1&scene=loading", size: PHONE },
  { title: "No 3D, step 1. The map with five names", query: "step=1&scene=map", size: PHONE },
  { title: "No 3D, step 5. The map and the message", query: "step=5&scene=map", size: PHONE },
  { title: "Failed download, step 5. The map and Cuba lagi", query: "step=5&scene=failed", size: PHONE },
  { title: "Projector at 200% zoom, 960x540. Step 3, English", query: "step=3&lang=en", size: ZOOMED },
  { title: "960x540. Step 13, with the note open", query: "step=13&note=open", size: ZOOMED },
  { title: "960x540. No 3D, step 6", query: "step=6&scene=map", size: ZOOMED },
  { title: "Laptop, 1280x720. Step 1", query: "step=1", size: LAPTOP },
];

function Index() {
  return (
    <main className="preview">
      <div className="preview__intro">
        <h1 className="vh-title">Tawaf walk, pause 2</h1>
        <p className="vh-text">
          Each frame is one state of the walk screen, built from the real components. A drawing stands in for the 3D place, so the camera cuts and
          does not fly. Each frame works: use Seterusnya, Kembali, BM, EN and the arrow keys.
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

createRoot(document.getElementById("root")!).render(params.has("step") ? <Walk /> : <Index />);
