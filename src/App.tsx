import { useCallback, useState } from "react";
import { MessageCard } from "./components/MessageCard";
import { Notice } from "./components/Notice";
import { StepPanel } from "./components/StepPanel";
import { TopBar } from "./components/TopBar";
import { TEXT } from "./content/text";
import { pickLanguage, readStoredLanguage, storeLanguage, type Language } from "./lib/language";
import { Scene, type SceneState } from "./scene/Scene";

export function App() {
  const [language, setLanguage] = useState<Language>(() => pickLanguage(readStoredLanguage(), navigator.language));
  const [scene, setScene] = useState<SceneState>("loading");
  const onScene = useCallback((state: SceneState) => setScene(state), []);
  const words = TEXT[language];
  document.documentElement.lang = language;

  const chooseLanguage = (next: Language) => {
    storeLanguage(next);
    setLanguage(next);
  };

  return (
    <div className="app">
      <TopBar siteName={words.siteName} switchLabel={words.languageSwitch} language={language} onLanguage={chooseLanguage} />
      <main className="app__main">
        <Scene words={words} state={scene} onState={onScene} />
        <div className="app__side">
          {scene === "unsupported" && <MessageCard message={words.no3d} />}
          {scene === "failed" && (
            <MessageCard message={words.failed} retry={{ label: words.retry, onRetry: () => location.reload() }} />
          )}
          <StepPanel title={words.title} text={words.text} />
          <Notice>{words.noticeReview}</Notice>
          <Notice>{words.noticeLayout}</Notice>
        </div>
      </main>
    </div>
  );
}
