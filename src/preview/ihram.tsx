import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../docs/design/design-system/styles.css";
import "../app.css";
import "./preview.css";
import { ArabicBlock } from "../components/ArabicBlock";
import { BirAliMap } from "../components/BirAliMap";
import { LoadingCard } from "../components/LoadingCard";
import { MessageCard } from "../components/MessageCard";
import { Note } from "../components/Note";
import { Notice } from "../components/Notice";
import { StepActions } from "../components/StepActions";
import { StepPanel } from "../components/StepPanel";
import { TopBar } from "../components/TopBar";
import { IHRAM } from "../content/ihram";
import { TEXT } from "../content/text";
import type { Language } from "../lib/language";

// The preview of the ihram spec, pause 2. With no "step" in the address it lists each state in a frame.
// With a "step" it shows one working ihram screen from the real components. The top-view map stands in for the 3D Bir Ali.
const params = new URLSearchParams(location.search);
const TOTAL = 8;

function Screen() {
  const [language, setLanguage] = useState<Language>(params.get("lang") === "en" ? "en" : "ms");
  const [step, setStep] = useState(Number(params.get("step")));
  const scene = params.get("scene") ?? "map";
  const words = TEXT[language];
  const now = IHRAM[language][step - 1];
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
        <section className="scene" data-scene data-state={scene}>
          <div className="scene__frame vh-marble">
            {scene !== "loading" && <BirAliMap step={step} words={words} label={`${words.birAliMap}. ${now.where}`} />}
            {scene === "loading" && <LoadingCard title={words.loadingBirAli} hint={words.loadingHint} />}
          </div>
        </section>
        <div className="app__side">
          {scene === "failed" && <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />}
          <StepPanel
            title={now.title}
            text={now.text}
            step={step}
            progress={{ label: words.ihramProgress.replace("{n}", String(step)).replace("{total}", String(TOTAL)), beads: null }}
          >
            {now.recitation && <ArabicBlock {...now.recitation} />}
            {now.note && <Note label={words.noteLabel} text={now.note} open={params.get("note") === "open"} />}
            {last && (
              <button type="button" className="vh-button vh-button--quiet walk__again" onClick={() => setStep(1)}>
                {words.startAgain}
              </button>
            )}
          </StepPanel>
          {scene === "map" && <MessageCard message={words.no3d} />}
          <Notice>{words.noticeReview}</Notice>
          <Notice>{words.noticeLayout}</Notice>
          <StepActions
            back={step > 1 ? { label: words.back, onAct: () => setStep(step - 1) } : undefined}
            next={last ? { label: words.goTawaf, onAct: () => undefined } : { label: words.next, onAct: () => setStep(step + 1) }}
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
  { title: "Step 1. Bir Ali and its parts, and the three-part switch", query: "step=1", size: PHONE },
  { title: "Step 2. Before ihram, the note open", query: "step=2&note=open", size: PHONE },
  { title: "Step 3. The ihram clothes", query: "step=3", size: PHONE },
  { title: "Step 4. Solat sunat ihram, in the prayer hall", query: "step=4", size: PHONE },
  { title: "Step 5. The niat, with the plane line", query: "step=5", size: PHONE },
  { title: "Step 6. Talbiyah, at the bus park", query: "step=6", size: PHONE },
  { title: "Step 7. The rules of ihram", query: "step=7", size: PHONE },
  { title: "Step 8. On to Makkah, Teruskan ke tawaf", query: "step=8", size: PHONE },
  { title: "Step 6, English, dark", query: "step=6&lang=en&theme=dark", size: PHONE },
  { title: "Step 1, dark", query: "step=1&theme=dark", size: PHONE },
  { title: "Failed download, step 4. The map and Cuba lagi", query: "step=4&scene=failed", size: PHONE },
  { title: "Bir Ali loads, step 1", query: "step=1&scene=loading", size: PHONE },
  { title: "Projector at 200% zoom, 960x540. Step 5, English", query: "step=5&lang=en", size: ZOOMED },
  { title: "Laptop, 1280x720. Step 1", query: "step=1", size: LAPTOP },
  { title: "Laptop, 1280x720. Step 8, English", query: "step=8&lang=en", size: LAPTOP },
];

function Index() {
  return (
    <main className="preview">
      <div className="preview__intro">
        <h1 className="vh-title">Ihram walk, pause 2</h1>
        <p className="vh-text">
          Each frame is one state of the ihram walk, built from the real components. The top-view map of Bir Ali stands in for the 3D Bir Ali, which /build makes.
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
