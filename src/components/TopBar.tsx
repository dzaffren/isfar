import type { Language } from "../lib/language";

export type Rite = "tawaf" | "sai";

type Props = {
  siteName: string;
  switchLabel: string;
  language: Language;
  onLanguage: (language: Language) => void;
  rite?: { label: string; tawaf: string; sai: string; now: Rite; onRite: (rite: Rite) => void };
};

export function TopBar({ siteName, switchLabel, language, onLanguage, rite }: Props) {
  return (
    <header className="vh-panel__head vh-kiswah topbar">
      <div className="vh-panel__where">
        <svg className="vh-mark-kaabah" aria-hidden="true" viewBox="0 0 28 28">
          <rect x="3.75" y="4.75" width="20.5" height="19.5" rx="3" />
          <rect className="vh-mark-kaabah__band" x="4" y="9" width="20" height="3.5" />
        </svg>
        <span className="topbar__name">{siteName}</span>
      </div>
      {rite && (
        <div className="vh-switch topbar__rite" role="group" aria-label={rite.label}>
          <button type="button" aria-pressed={rite.now === "tawaf"} onClick={() => rite.onRite("tawaf")}>
            {rite.tawaf}
          </button>
          <button type="button" aria-pressed={rite.now === "sai"} onClick={() => rite.onRite("sai")}>
            {rite.sai}
          </button>
        </div>
      )}
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
