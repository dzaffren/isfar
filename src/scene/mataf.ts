// The plan of the tawaf place, in metres. x and y lie on the floor, and the centre of the Kaabah is 0,0.
// Seen from above, the walk goes counter-clockwise: Hajar Aswad, the door, Hijr Ismail, Rukun Yamani.
// tools/kaabah.py uses the same axes, so the door wall is the wall at x = -5.5.
export type Point = readonly [number, number];

export const KAABAH = { width: 11, depth: 12.5, height: 13, bandLow: 9.2, bandHigh: 10.4 };
export const HAJAR_ASWAD: Point = [-5.5, 6.25];
export const RUKUN_YAMANI: Point = [5.5, 6.25];
export const DOOR: Point = [-5.5, 3.05];
// A low wall, half an ellipse, on the wall at y = -6.25.
export const HIJR = { centre: [0, -6.25] as Point, across: 5.5, out: 8.5, height: 1.3 };
export const MAQAM: Point = [-18.5, 2.5];
// The ring of arcades around the mataf.
export const RING = 32;

// The path of one circuit: an ellipse that clears the Kaabah and Hijr Ismail.
const PATH = { centre: [0, -2.5] as Point, across: 14, along: 15.5 };

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
];
