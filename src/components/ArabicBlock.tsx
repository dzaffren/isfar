import type { Recitation } from "../content/tawaf";

export function ArabicBlock({ arabic, sound, meaning }: Recitation) {
  return (
    <div className="vh-arabic vh-kiswah">
      <p className="vh-arabic__text" lang="ar" dir="rtl">
        {arabic}
      </p>
      <p className="vh-arabic__sound">{sound}</p>
      <p className="vh-arabic__meaning">{meaning}</p>
    </div>
  );
}
