import plan from "./plan.json" with { type: "json" };
import type { Point } from "./mataf";

// The plan of the sa'i place, in metres. x runs along the mas'a from Safa (x < 0) to Marwah (x > 0), and y runs across it.
// The mas'a is stylised and shorter than the real one (D66). The sizes live in plan.json (D43).
const point = ([x, y]: number[]): Point => [x, y];

export const MASA = plan.masa;
export const SAFA = point(plan.masa.safa.at);
export const MARWAH = point(plan.masa.marwah.at);
// The two green lights cross the mas'a. Men walk quickly between them.
export const GREEN = plan.masa.green.at;
export const WALK = plan.masa.walk;

export type SaiPart = "safa" | "marwah" | "green";

export const SAI_PARTS: Record<SaiPart, Point> = {
  safa: SAFA,
  marwah: MARWAH,
  green: [(GREEN[0] + GREEN[1]) / 2, 0],
};

// Where the marker stands on each step, which names show, and which way the path line runs.
// "marwah" runs from Safa to Marwah, "safa" runs back. Null shows no path line.
export type SaiSpot = { at: Point | null; names: SaiPart[]; towards: "marwah" | "safa" | null };

const ON_SAFA: Point = [WALK.from - 3, 0];
const ON_MARWAH: Point = [WALK.to + 2, 0];

export const SAI_SPOTS: SaiSpot[] = [
  { at: null, names: ["safa", "marwah", "green"], towards: null },
  { at: [WALK.from + 4, 0], names: ["safa"], towards: null },
  { at: ON_SAFA, names: ["safa"], towards: null },
  { at: [GREEN[0] - 8, 0], names: ["green"], towards: "marwah" },
  { at: [(GREEN[0] + GREEN[1]) / 2, 0], names: ["green"], towards: "marwah" },
  { at: ON_MARWAH, names: ["marwah"], towards: "marwah" },
  { at: ON_SAFA, names: ["safa"], towards: "safa" },
  { at: ON_MARWAH, names: ["marwah"], towards: "marwah" },
  { at: ON_SAFA, names: ["safa"], towards: "safa" },
  { at: ON_MARWAH, names: ["marwah"], towards: "marwah" },
  { at: ON_SAFA, names: ["safa"], towards: "safa" },
  { at: ON_MARWAH, names: ["marwah"], towards: "marwah" },
  { at: ON_MARWAH, names: ["safa", "marwah", "green"], towards: null },
];
