import { GREEN_LIGHT, HAJAR_ASWAD, PARTS, SPOTS, type Part, type Spot } from "./mataf";

// The camera of each step, in the plan's metres: x and y on the floor, z up. three.js is y up, and place.ts turns it.
export type V3 = readonly [number, number, number];
export type View = { from: V3; to: V3 };

const unit = (a: V3): V3 => {
  const length = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / length, a[1] / length, a[2] / length];
};

// The camera of a step: wide over the whole place, or towards the spot of the marker.
export function viewOf(step: number): View {
  const spot = SPOTS[step - 1];
  if (!spot.at) return { from: [-21, 30, 52], to: [-5, 2, 0] };
  const [x, y] = spot.at;
  if (spot.view === "start") {
    // From the side of the guide line: the corner on the left, the green light on the right.
    const [lampX, lampY] = GREEN_LIGHT;
    const length = Math.hypot(lampX, lampY);
    const midX = HAJAR_ASWAD[0] + (lampX - HAJAR_ASWAD[0]) * 0.46;
    const midY = HAJAR_ASWAD[1] + (lampY - HAJAR_ASWAD[1]) * 0.46;
    return { from: [midX + (lampY / length) * 32, midY - (lampX / length) * 32, 21], to: [midX, midY, 1] };
  }
  const away = unit([x, y + 2.5, 0]);
  if (spot.view === "approach") return { from: [x + away[0] * 16, y + away[1] * 16, 15], to: [x * 0.5, y * 0.5, 0] };
  // A walk: from behind and above the marker, with the Kaabah on the left.
  const ahead: V3 = [-away[1], away[0], 0];
  return {
    from: [x - ahead[0] * 16 + away[0] * 9, y - ahead[1] * 16 + away[1] * 9, 12],
    to: [x + ahead[0] * 4 - away[0] * 6, y + ahead[1] * 4 - away[1] * 6, 1.5],
  };
}

// The camera between two views, at t from 0 to 1. It keeps on an arc around the Kaabah, so it never passes through it (D45).
export function between(one: View, two: View, t: number): View {
  const radius = (at: V3) => Math.hypot(at[0], at[1]);
  const angle = (at: V3) => Math.atan2(at[1], at[0]);
  let turn = angle(two.from) - angle(one.from);
  if (turn > Math.PI) turn -= 2 * Math.PI;
  if (turn < -Math.PI) turn += 2 * Math.PI;
  const around = angle(one.from) + turn * t;
  const out = radius(one.from) + (radius(two.from) - radius(one.from)) * t;
  const mix = (a: V3, b: V3): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  return {
    from: [out * Math.cos(around), out * Math.sin(around), one.from[2] + (two.from[2] - one.from[2]) * t],
    to: mix(one.to, two.to),
  };
}

// The height of each name above its part, in metres.
const NAME_HEIGHT: Record<Part, number> = { hajarAswad: 1.5, door: 4.2, hijr: 1.3, yamani: 1.5, maqam: 2.6, greenLight: 6 };

export function nameAnchor(part: Part): V3 {
  return [PARTS[part][0], PARTS[part][1], NAME_HEIGHT[part]];
}

// In the wide view, each name has its own place beside its part, in pixels. In the other views, it sits above its part.
const WIDE_PUSH: Record<Part, readonly [number, number]> = {
  hajarAswad: [-40, 60],
  door: [90, -10],
  hijr: [40, -34],
  yamani: [-70, 30],
  maqam: [20, 54],
  greenLight: [0, -38],
};

export function namePlace(part: Part, view: Spot["view"]): readonly [number, number] {
  return view === "wide" ? WIDE_PUSH[part] : [0, -38];
}
