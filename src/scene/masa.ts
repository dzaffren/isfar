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
// Each way has its own lane, with a low barrier between them that stops short of each hill (D81).
// y is the middle of each lane. The lane to Marwah is on the right of a person at Safa who faces Marwah (D82).
export const LANES = plan.masa.lanes;
export const BARRIER = plan.masa.barrier;
// A gap in the end wall behind Marwah, with a strip of open floor past it, where the pilgrim goes for tahallul (full-umrah O10).
export const EXIT = plan.masa.exit;

// The path of one walk: off the hill, into its lane, along the barrier, and up onto the other hill.
export function laneLine(towards: "marwah" | "safa"): Point[] {
  const y = towards === "marwah" ? LANES.toMarwah : LANES.toSafa;
  const line: Point[] = [[WALK.from, 0], [BARRIER.from, y], [BARRIER.to, y], [WALK.to, 0]];
  return towards === "marwah" ? line : line.reverse();
}

export type SaiPart = "safa" | "marwah" | "green";

export const SAI_PARTS: Record<SaiPart, Point> = {
  safa: SAFA,
  marwah: MARWAH,
  green: [(GREEN[0] + GREEN[1]) / 2, 0],
};

// The height of each name above the floor, in metres: over the top of each hill, and over the walls for the green lights.
export const SAI_NAME_HEIGHT: Record<SaiPart, number> = {
  safa: MASA.safa.height + 2.5,
  marwah: MASA.marwah.height + 2.5,
  green: MASA.height + 1.5,
};

// The floor rises over each hill: a low mound, half an ellipsoid, as tools/masa.py builds it.
export function groundAt([x, y]: Point): number {
  for (const hill of [MASA.safa, MASA.marwah]) {
    const across = (x - hill.at[0]) / hill.radius;
    const along = (y - hill.at[1]) / (MASA.width / 2);
    const inside = 1 - across ** 2 - along ** 2;
    if (inside > 0) return hill.height * Math.sqrt(inside);
  }
  return 0;
}

// Where the marker stands on each step, which names show, which way the path line runs, and the way the camera looks.
// "marwah" runs from Safa to Marwah, "safa" runs back. Null shows no path line.
// A wide view looks along the whole hall, from behind Safa, or from behind Marwah when the marker is there.
// On a hill, the camera stands beyond it and looks towards the next hill, back along the walk that just ended.
export type SaiSpot = { at: Point | null; names: SaiPart[]; towards: "marwah" | "safa" | null; view: "wide" | "marwah" | "safa" };

const ON_SAFA: Point = [WALK.from - 3, 0];
const ON_MARWAH: Point = [WALK.to + 2, 0];

export const SAI_SPOTS: SaiSpot[] = [
  { at: null, names: ["safa", "marwah", "green"], towards: null, view: "wide" },
  { at: [WALK.from + 4, 0], names: ["safa"], towards: null, view: "safa" },
  { at: ON_SAFA, names: ["safa"], towards: null, view: "marwah" },
  { at: [GREEN[0] - 8, LANES.toMarwah], names: ["green"], towards: "marwah", view: "marwah" },
  { at: [(GREEN[0] + GREEN[1]) / 2, LANES.toMarwah], names: ["green"], towards: "marwah", view: "marwah" },
  { at: ON_MARWAH, names: ["marwah"], towards: "marwah", view: "safa" },
  { at: ON_SAFA, names: ["safa"], towards: "safa", view: "marwah" },
  { at: ON_MARWAH, names: ["marwah"], towards: "marwah", view: "safa" },
  { at: ON_SAFA, names: ["safa"], towards: "safa", view: "marwah" },
  { at: ON_MARWAH, names: ["marwah"], towards: "marwah", view: "safa" },
  { at: ON_SAFA, names: ["safa"], towards: "safa", view: "marwah" },
  { at: ON_MARWAH, names: ["marwah"], towards: "marwah", view: "safa" },
  { at: ON_MARWAH, names: ["safa", "marwah", "green"], towards: null, view: "wide" },
];

// Tahallul: the marker on flat floor past the Marwah rock, seen from the hall, then the wide view with the marker still there (D116).
const PAST_MARWAH: Point = [MASA.length / 2 + EXIT.depth - 1, 0];

export const TAHALLUL_SPOTS: SaiSpot[] = [
  { at: PAST_MARWAH, names: ["marwah"], towards: null, view: "marwah" },
  { at: PAST_MARWAH, names: ["safa", "marwah", "green"], towards: null, view: "wide" },
];
