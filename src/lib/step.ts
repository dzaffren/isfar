// The rite and the step of the walk live in the address, as #tawaf-6 or #sai-5 (D30).
// A step outside its walk opens step 1 of that rite. Any other address opens step 1 of tawaf.
export type Rite = "tawaf" | "sai";

export const TOTAL: Record<Rite, number> = { tawaf: 15, sai: 13 };

const PLACE = /^#(tawaf|sai)-([1-9]\d*)$|^#(tawaf|sai)-/;

export function readPlace(hash: string): { rite: Rite; step: number } {
  const match = PLACE.exec(hash);
  if (!match) return { rite: "tawaf", step: 1 };
  const rite = (match[1] ?? match[3]) as Rite;
  const step = match[2] ? Number(match[2]) : 1;
  return { rite, step: step <= TOTAL[rite] ? step : 1 };
}

export function stepHash(rite: Rite, step: number): string {
  return `#${rite}-${step}`;
}

// The check has one address, so a reload starts it again at question 1 (D51, D53).
export const CHECK_HASH = "#semak";

export function isCheck(hash: string): boolean {
  return hash === CHECK_HASH;
}
