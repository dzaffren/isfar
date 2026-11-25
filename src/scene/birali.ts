import plan from "./plan.json" with { type: "json" };
import type { Point } from "./mataf";

// The plan of the ihram place, Bir Ali, in metres. x runs east and y runs north, from the middle of the mosque area.
// Bir Ali is stylised (D10): a square mosque round an open courtyard, one tall minaret, a washroom block and a bus park.
// Makkah lies to the south, so the deeper prayer hall is on the south side of the courtyard. The sizes live in plan.json (D43).
export const BIRALI = plan.birali;

const point = ([x, y]: number[]): Point => [x, y];
const MOSQUE = point(BIRALI.mosque.at);
const COURT = point(BIRALI.court.at);
const WASHROOMS = point(BIRALI.washrooms.at);
const BUS_PARK = point(BIRALI.busPark.at);

export type IhramPart = "hall" | "minaret" | "washrooms" | "busPark";

// Where the lead line of each name meets the place.
export const IHRAM_PARTS: Record<IhramPart, Point> = {
  hall: [MOSQUE[0], MOSQUE[1] - BIRALI.mosque.size / 4],
  minaret: point(BIRALI.minaret.at),
  washrooms: WASHROOMS,
  busPark: BUS_PARK,
};

// Where the marker stands on each step, and which names show (D89, D91). Null shows no marker.
export type IhramSpot = { at: Point | null; names: IhramPart[] };

const AT_WASHROOMS: Point = [WASHROOMS[0] + BIRALI.washrooms.width / 2 + 3, WASHROOMS[1]];
const IN_HALL: Point = [MOSQUE[0], MOSQUE[1] - BIRALI.mosque.size / 2 + 8];
const AT_BUS: Point = [BUS_PARK[0] + 10, BUS_PARK[1] - 4];

export const IHRAM_SPOTS: IhramSpot[] = [
  { at: null, names: ["hall", "minaret", "washrooms", "busPark"] },
  { at: AT_WASHROOMS, names: ["washrooms"] },
  { at: AT_WASHROOMS, names: ["washrooms"] },
  { at: IN_HALL, names: ["hall"] },
  { at: COURT, names: [] },
  { at: AT_BUS, names: ["busPark"] },
  { at: AT_BUS, names: ["busPark"] },
  { at: AT_BUS, names: ["hall", "minaret", "washrooms", "busPark"] },
];

// The height of each name above the ground, in metres: over the walls, near the top of the minaret, over the washroom roof, and over the buses.
export const IHRAM_NAME_HEIGHT: Record<IhramPart, number> = {
  hall: BIRALI.mosque.height + 2,
  minaret: BIRALI.minaret.height - 6,
  washrooms: BIRALI.washrooms.height + 2,
  busPark: 4,
};
