import plan from "./plan.json" with { type: "json" };

// The plan of the tawaf place, in metres. x and y lie on the floor, and the centre of the Kaabah is 0,0.
// Seen from above, the walk goes counter-clockwise: Hajar Aswad, the door, Hijr Ismail, Rukun Yamani.
// The sizes live in plan.json, which tools/mataf.py also reads (D43). The door wall is the wall at x = -5.5.
export type Point = readonly [number, number];

const point = ([x, y]: number[]): Point => [x, y];

export const PLAN = plan;
export const KAABAH = plan.kaabah;
export const HAJAR_ASWAD = point(plan.hajarAswad.at);
export const RUKUN_YAMANI = point(plan.rukunYamani);
export const DOOR = point(plan.door.at);
// A low wall, half an ellipse, on the wall at y = -6.25.
export const HIJR = { ...plan.hijr, centre: point(plan.hijr.centre) };
export const MAQAM = point(plan.maqam.at);
// The ring of arcades around the mataf.
export const RING = plan.ring.radius;

// The path of one circuit: an ellipse that clears the Kaabah and Hijr Ismail.
const PATH = plan.path;

export function onPath(degrees: number): Point {
  const angle = (degrees * Math.PI) / 180;
  return [PATH.centre[0] + PATH.across * Math.cos(angle), PATH.centre[1] + PATH.along * Math.sin(angle)];
}

// The point at a distance from the centre of the Kaabah, on the line through a corner.
function onLine(corner: Point, distance: number): Point {
  const length = Math.hypot(corner[0], corner[1]);
  return [(corner[0] / length) * distance, (corner[1] / length) * distance];
}

// The angle on the path where the line from the centre through a corner crosses it.
function pathAngle(corner: Point): number {
  let best = 0;
  let gap = Infinity;
  const target = Math.atan2(corner[1], corner[0]);
  for (let degrees = 0; degrees < 360; degrees += 0.25) {
    const [x, y] = onPath(degrees);
    const miss = Math.abs(Math.atan2(y, x) - target);
    if (miss < gap) {
      gap = miss;
      best = degrees;
    }
  }
  return best;
}

export const START_ANGLE = pathAngle(HAJAR_ASWAD);
export const START = onPath(START_ANGLE);
// The guide line runs from the Hajar Aswad corner to the green light on the arcade wall.
export const GREEN_LIGHT = onLine(HAJAR_ASWAD, RING);

export type Part = "hajarAswad" | "door" | "hijr" | "yamani" | "maqam" | "greenLight";

export const PARTS: Record<Part, Point> = {
  hajarAswad: HAJAR_ASWAD,
  door: DOOR,
  hijr: [0, HIJR.centre[1] - HIJR.out],
  yamani: RUKUN_YAMANI,
  maqam: MAQAM,
  greenLight: GREEN_LIGHT,
};

// Where the marker stands on each step, which names show, and whether the path line shows.
// The view is wide (the whole place), an approach (towards the Kaabah), the start (across the guide line),
// or a walk (along the path, from behind and above).
export type Spot = { at: Point | null; names: Part[]; path: boolean; view: "wide" | "approach" | "start" | "walk" };

const AT_THE_LINE: Spot = { at: START, names: ["hajarAswad"], path: true, view: "walk" };

export const SPOTS: Spot[] = [
  { at: null, names: ["hajarAswad", "door", "hijr", "yamani", "maqam"], path: false, view: "wide" },
  { at: onLine(HAJAR_ASWAD, 27), names: [], path: false, view: "approach" },
  { at: START, names: ["hajarAswad", "greenLight"], path: false, view: "start" },
  { at: onPath(180), names: ["door", "maqam"], path: true, view: "walk" },
  { at: onPath(270), names: ["hijr"], path: true, view: "walk" },
  { at: onPath(pathAngle(RUKUN_YAMANI)), names: ["yamani"], path: true, view: "walk" },
  { at: onPath(90), names: ["yamani", "hajarAswad"], path: true, view: "walk" },
  AT_THE_LINE,
  AT_THE_LINE,
  AT_THE_LINE,
  AT_THE_LINE,
  AT_THE_LINE,
  AT_THE_LINE,
  AT_THE_LINE,
  { at: null, names: [], path: false, view: "wide" },
  // Behind Maqam Ibrahim, on the line from the Kaabah through it, facing the Kaabah for the two rakaat.
  { at: [MAQAM[0] - 4.5, MAQAM[1] + 0.6], names: ["maqam"], path: false, view: "approach" },
];
