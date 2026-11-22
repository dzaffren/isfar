export type Language = "ms" | "en";

const KEY = "isfar.lang";

function isLanguage(value: string | null): value is Language {
  return value === "ms" || value === "en";
}

export function pickLanguage(stored: string | null, deviceLanguage: string | undefined): Language {
  if (isLanguage(stored)) return stored;
  return deviceLanguage?.toLowerCase().startsWith("en") ? "en" : "ms";
}

export function readStoredLanguage(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function storeLanguage(language: Language): void {
  try {
    localStorage.setItem(KEY, language);
  } catch {
    // Storage is blocked. The choice lasts until the page closes.
  }
}
