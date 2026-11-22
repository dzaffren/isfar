import type { Language } from "../lib/language";

type Props = { siteName: string; switchLabel: string; language: Language; onLanguage: (language: Language) => void };

export function TopBar({ siteName, switchLabel, language, onLanguage }: Props) {
  return (
    <header className="vh-panel__head vh-kiswah">
      <div className="vh-panel__where">
        <svg className="vh-mark-kaabah" aria-hidden="true" viewBox="0 0 28 28">
          <rect x="3.75" y="4.75" width="20.5" height="19.5" rx="3" />
          <rect className="vh-mark-kaabah__band" x="4" y="9" width="20" height="3.5" />
        </svg>
        {siteName}
      </div>
      <div className="vh-switch" role="group" aria-label={switchLabel}>
        <button type="button" aria-pressed={language === "ms"} onClick={() => onLanguage("ms")}>
          BM
        </button>
        <button type="button" aria-pressed={language === "en"} onClick={() => onLanguage("en")}>
          EN
        </button>
      </div>
    </header>
  );
}
