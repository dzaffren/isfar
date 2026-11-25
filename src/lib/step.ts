// The rite and the step of the walk live in the address, as #tawaf-6 or #sai-5 (D30).
// A number outside the walk, as #sai-0 or #sai-99, opens step 1 of that rite. Any other address opens step 1 of tawaf.
export type Rite = "tawaf" | "sai";

export const TOTAL: Record<Rite, number> = { tawaf: 15, sai: 13 };

const PLACE = /^#(tawaf|sai)-(\d+)$/;
const STEP = /^[1-9]\d*$/;

export function readPlace(hash: string): { rite: Rite; step: number } {
  if (hash === CHECK_HASH.sai) return { rite: "sai", step: 1 };
  const match = PLACE.exec(hash);
  if (!match) return { rite: "tawaf", step: 1 };
  const rite = match[1] as Rite;
  const step = STEP.test(match[2]) ? Number(match[2]) : 1;
  return { rite, step: step <= TOTAL[rite] ? step : 1 };
}

export function stepHash(rite: Rite, step: number): string {
  return `#${rite}-${step}`;
}

// Each rite's check has one address, so a reload starts it again at question 1 (D51, D53, D84).
// The address of a check reads as step 1 of its rite, so the scene shows the place of that rite.
export const CHECK_HASH: Record<Rite, string> = { tawaf: "#semak", sai: "#semak-sai" };

export function isCheck(hash: string): boolean {
  return hash === CHECK_HASH.tawaf || hash === CHECK_HASH.sai;
}
