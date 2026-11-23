import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PART_WORD } from "../components/MatafMap";
import type { Words } from "../content/text";
import { DOOR, GREEN_LIGHT, HAJAR_ASWAD, HIJR, KAABAH, MAQAM, PARTS, RING, SPOTS, onPath, type Part } from "../scene/mataf";

// A drawing that stands in for the 3D place, in the preview only. It draws the plan of mataf.ts from the camera of each step.
// /build replaces it with the real 3D place. Nothing here ships.
type V3 = readonly [number, number, number];

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => {
  const length = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / length, a[1] / length, a[2] / length];
};
const NEAR = 0.5;
const TOP = KAABAH.height + 0.4;
const HALF_X = KAABAH.width / 2;
const HALF_Y = KAABAH.depth / 2;
const WIDE_PUSH: Record<Part, readonly [number, number]> = { hajarAswad: [-40, 60], door: [90, -10], hijr: [40, -34], yamani: [-70, 30], maqam: [20, 54], greenLight: [0, -38] };
const NAME_HEIGHT: Record<Part, number> = { hajarAswad: 1.5, door: 4.2, hijr: 1.3, yamani: 1.5, maqam: 2.6, greenLight: 6 };

// The camera of a step: wide over the whole place, or behind and above the marker.
function camera(step: number): { from: V3; to: V3 } {
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
  const ahead: V3 = [-away[1], away[0], 0];
  return {
    from: [x - ahead[0] * 16 + away[0] * 9, y - ahead[1] * 16 + away[1] * 9, 12],
    to: [x + ahead[0] * 4 - away[0] * 6, y + ahead[1] * 4 - away[1] * 6, 1.5],
  };
}

type Props = { step: number; words: Words; label: string };

export function Standin({ step, words, label }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 320 });
  useLayoutEffect(() => {
    const measure = () => setSize({ width: frame.current!.clientWidth, height: frame.current!.clientHeight });
    const watch = new ResizeObserver(measure);
    watch.observe(frame.current!);
    measure();
    return () => watch.disconnect();
  }, []);

  const { width, height } = size;
  const spot = SPOTS[step - 1];
  const { from, to } = camera(step);
  const forward = unit(sub(to, from));
  const right = unit(cross(forward, [0, 0, 1]));
  const up = cross(right, forward);
  const focal = height / 2 / Math.tan((40 * Math.PI) / 360);
  const eye = (point: V3): V3 => {
    const d = sub(point, from);
    return [dot(d, right), dot(d, up), dot(d, forward)];
  };
  const screen = (e: V3): [number, number] => [width / 2 + (e[0] * focal) / e[2], height / 2 - (e[1] * focal) / e[2]];
  const far = (point: V3) => Math.hypot(point[0] - from[0], point[1] - from[1], point[2] - from[2]);
  const faces = (normal: V3, at: V3) => dot(normal, sub(from, at)) > 0;

  // Cut a shape at the near plane, then put it on the screen.
  const points = (shape: V3[], closed = true): string | null => {
    const eyes = shape.map(eye);
    const kept: V3[] = [];
    const last = closed ? eyes.length : eyes.length - 1;
    for (let index = 0; index < last; index += 1) {
      const a = eyes[index];
      const b = eyes[(index + 1) % eyes.length];
      if (a[2] >= NEAR) kept.push(a);
      if (a[2] >= NEAR !== b[2] >= NEAR) {
        const t = (NEAR - a[2]) / (b[2] - a[2]);
        kept.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
      }
    }
    if (!closed && eyes[last][2] >= NEAR) kept.push(eyes[last]);
    if (kept.length < 2) return null;
    return kept.map((e) => screen(e).map((value) => value.toFixed(1)).join(",")).join(" ");
  };
  let count = 0;
  const shape = (className: string, corners: V3[]): ReactNode => {
    const at = points(corners);
    count += 1;
    return at && <polygon key={count} className={className} points={at} />;
  };
  const dotAt = (className: string, at: V3, metres: number): ReactNode => {
    const e = eye(at);
    if (e[2] < NEAR) return null;
    const [x, y] = screen(e);
    count += 1;
    return <circle key={count} className={className} cx={x} cy={y} r={Math.max(3, (focal * metres) / e[2])} />;
  };
  const ring = (radius: number, z: number, sides: number): V3[] =>
    Array.from({ length: sides }, (_, index) => {
      const angle = (index / sides) * 2 * Math.PI;
      return [radius * Math.cos(angle), radius * Math.sin(angle), z] as V3;
    });

  const floor: ReactNode[] = [shape("scene__floor", ring(RING, 0, 48))];

  // The guide line, the path of the circuit with its arrows, and the marker.
  const [lineX, lineY] = GREEN_LIGHT;
  const across = unit([-lineY, lineX, 0]);
  floor.push(
    shape("scene__guide", [
      [HAJAR_ASWAD[0] + across[0] * 0.35, HAJAR_ASWAD[1] + across[1] * 0.35, 0],
      [lineX + across[0] * 0.35, lineY + across[1] * 0.35, 0],
      [lineX - across[0] * 0.35, lineY - across[1] * 0.35, 0],
      [HAJAR_ASWAD[0] - across[0] * 0.35, HAJAR_ASWAD[1] - across[1] * 0.35, 0],
    ]),
  );
  if (spot.path) {
    for (let degrees = 0; degrees < 360; degrees += 6) {
      const [x, y] = onPath(degrees);
      const [nextX, nextY] = onPath(degrees + 3.5);
      const at = points([[x, y, 0], [nextX, nextY, 0]], false);
      count += 1;
      if (at) floor.push(<polyline key={count} className="scene__path" points={at} />);
    }
    for (const degrees of [20, 80, 150, 210, 250, 290, 330]) {
      const [x, y] = onPath(degrees);
      const [nextX, nextY] = onPath(degrees + 1);
      const along = unit([nextX - x, nextY - y, 0]);
      const side: V3 = [-along[1], along[0], 0];
      floor.push(
        shape("scene__arrow", [
          [x + along[0] * 1.4, y + along[1] * 1.4, 0],
          [x - along[0] * 0.9 + side[0] * 0.9, y - along[1] * 0.9 + side[1] * 0.9, 0],
          [x - along[0] * 0.9 - side[0] * 0.9, y - along[1] * 0.9 - side[1] * 0.9, 0],
        ]),
      );
    }
  }
  if (spot.at) {
    const [x, y] = spot.at;
    floor.push(shape("scene__marker", ring(1.5, 0, 28).map(([px, py]) => [x + px, y + py, 0] as V3)));
  }

  // The ring of arcades: each wall that faces the camera, with its arch and its roof.
  const SIDES = 40;
  const posts = ring(RING, 0, SIDES);
  const roof = ring(RING + 4, 7, SIDES);
  const walls = posts
    .map((a, index) => ({ a, b: posts[(index + 1) % SIDES], roofA: roof[index], roofB: roof[(index + 1) % SIDES] }))
    .map((wall) => ({ ...wall, mid: [(wall.a[0] + wall.b[0]) / 2, (wall.a[1] + wall.b[1]) / 2, 3.5] as V3 }))
    .sort((one, two) => far(two.mid) - far(one.mid));
  const arcade: ReactNode[] = [];
  for (const { a, b, mid, roofA, roofB } of walls) {
    const lift = (z: number, at: V3): V3 => [at[0], at[1], z];
    // A roof right under the camera would hide the floor in front of it.
    if (far(mid) > 25) arcade.push(shape("scene__rim", [lift(7, a), lift(7, b), roofB, roofA]));
    if (!faces(unit([-mid[0], -mid[1], 0]), mid)) continue;
    arcade.push(shape("scene__rim", [a, b, lift(7, b), lift(7, a)]));
    const on = (u: number, z: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, z];
    const arch: V3[] = [on(0.2, 0), on(0.2, 3.4)];
    for (let angle = 150; angle >= 30; angle -= 30) arch.push(on(0.5 + 0.3 * Math.cos((angle * Math.PI) / 180), 3.4 + 1.8 * Math.sin((angle * Math.PI) / 180)));
    arch.push(on(0.8, 3.4), on(0.8, 0));
    arcade.push(shape("scene__arch", arch));
  }
  if (faces(unit([-lineX, -lineY, 0]), [lineX, lineY, 6])) arcade.push(dotAt("scene__lamp", [lineX * 0.99, lineY * 0.99, 6], 0.7));

  // The things that stand on the floor, the far ones first.
  const stands: { far: number; nodes: ReactNode[] }[] = [];

  const hijr: ReactNode[] = [];
  const curve = Array.from({ length: 13 }, (_, index) => {
    const angle = Math.PI + (index / 12) * Math.PI;
    return [HIJR.across * Math.cos(angle), HIJR.centre[1] + HIJR.out * Math.sin(angle)] as const;
  });
  curve
    .slice(0, -1)
    .map((a, index) => ({ a, b: curve[index + 1] }))
    .sort((one, two) => far([two.a[0], two.a[1], 0]) - far([one.a[0], one.a[1], 0]))
    .forEach(({ a, b }) => hijr.push(shape("scene__hijr", [[a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], HIJR.height], [a[0], a[1], HIJR.height]])));
  stands.push({ far: far([0, HIJR.centre[1] - HIJR.out / 2, 0]), nodes: hijr });

  const box = (className: string, x0: number, x1: number, y0: number, y1: number, z1: number, extra?: (normal: V3) => ReactNode[]): ReactNode[] => {
    const nodes: ReactNode[] = [];
    const sides: { normal: V3; corners: V3[]; tone: string }[] = [
      { normal: [-1, 0, 0], corners: [[x0, y1, 0], [x0, y0, 0], [x0, y0, z1], [x0, y1, z1]], tone: "" },
      { normal: [1, 0, 0], corners: [[x1, y0, 0], [x1, y1, 0], [x1, y1, z1], [x1, y0, z1]], tone: "" },
      { normal: [0, -1, 0], corners: [[x0, y0, 0], [x1, y0, 0], [x1, y0, z1], [x0, y0, z1]], tone: "--far" },
      { normal: [0, 1, 0], corners: [[x1, y1, 0], [x0, y1, 0], [x0, y1, z1], [x1, y1, z1]], tone: "--far" },
      { normal: [0, 0, 1], corners: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], tone: "--top" },
    ];
    for (const { normal, corners, tone } of sides) {
      if (!faces(normal, corners[0])) continue;
      nodes.push(shape(tone ? `${className} ${className}${tone}` : className, corners));
      if (extra) nodes.push(...extra(normal));
    }
    return nodes;
  };

  const strip = (normal: V3, low: number, high: number): V3[] => {
    const grow = 0.04;
    if (normal[0] !== 0) {
      const x = normal[0] * (HALF_X + grow);
      return [[x, -HALF_Y, low], [x, HALF_Y, low], [x, HALF_Y, high], [x, -HALF_Y, high]];
    }
    const y = normal[1] * (HALF_Y + grow);
    return [[-HALF_X, y, low], [HALF_X, y, low], [HALF_X, y, high], [-HALF_X, y, high]];
  };
  const kaabah = box("scene__face", -HALF_X, HALF_X, -HALF_Y, HALF_Y, TOP, (normal) => {
    if (normal[2] !== 0) return [];
    const nodes = [shape("scene__band", strip(normal, KAABAH.bandLow + 0.4, KAABAH.bandHigh + 0.4)), shape("scene__foot", strip(normal, 0, 0.4))];
    if (normal[0] === -1) {
      const x = -HALF_X - 0.05;
      nodes.push(shape("scene__door", [[x, DOOR[1] - 0.95, 2.6], [x, DOOR[1] + 0.95, 2.6], [x, DOOR[1] + 0.95, 5.8], [x, DOOR[1] - 0.95, 5.8]]));
    }
    return nodes;
  });
  if (faces([-1, 0, 0], [-HALF_X, 0, 0]) || faces([0, 1, 0], [0, HALF_Y, 0])) kaabah.push(dotAt("scene__stone", [HAJAR_ASWAD[0] - 0.1, HAJAR_ASWAD[1] + 0.1, 1.5], 0.45));
  stands.push({ far: far([0, 0, TOP / 2]), nodes: kaabah });

  stands.push({ far: far([MAQAM[0], MAQAM[1], 1.3]), nodes: box("scene__maqam", MAQAM[0] - 0.8, MAQAM[0] + 0.8, MAQAM[1] - 0.8, MAQAM[1] + 0.8, 2.6) });

  if (spot.at) {
    const [x, y] = spot.at;
    const pole = points([[x, y, 0], [x, y, 3]], false);
    stands.push({
      far: far([x, y, 1.5]),
      nodes: [pole && <polyline key="pole" className="scene__pole" points={pole} />, dotAt("scene__pin", [x, y, 3], 0.5)],
    });
  }
  stands.sort((one, two) => two.far - one.far);

  // The names: each one beside its part, moved down when two would overlap.
  const names = spot.names
    .map((part) => {
      const [partX, partY] = PARTS[part];
      const e = eye([partX, partY, NAME_HEIGHT[part]]);
      if (e[2] < NEAR) return null;
      const [atX, atY] = screen(e);
      const text = words[PART_WORD[part]];
      const wide = text.length * 9.4 + 24;
      // In the wide view, each name has its own place beside its part. In the other views, it sits above its part.
      const push = spot.view === "wide" ? WIDE_PUSH[part] : [0, -38];
      const x = Math.min(Math.max(atX + push[0], wide / 2 + 4), width - wide / 2 - 4);
      const y = Math.min(Math.max(atY + push[1], 22), height - 22);
      return { part, text, atX, atY, wide, x, y };
    })
    .filter((name) => name !== null)
    .sort((one, two) => one.y - two.y);
  names.forEach((name, index) => {
    for (const other of names.slice(0, index)) {
      if (Math.abs(name.x - other.x) >= (name.wide + other.wide) / 2 || Math.abs(name.y - other.y) >= 40) continue;
      name.y = other.y + 40 > height - 22 ? other.y - 40 : other.y + 40;
    }
  });

  return (
    <div ref={frame} className="standin" role="img" aria-label={label}>
      <svg className="scene__view" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <rect className="scene__sky" width={width} height={height} />
        {floor}
        {arcade}
        {stands.map((stand) => stand.nodes)}
        {names.map((name) => (
          <line key={name.part} className="scene__lead" x1={name.atX} y1={name.atY} x2={name.x} y2={name.y} />
        ))}
      </svg>
      {names.map((name) => (
        <span key={name.part} className="scene__name" style={{ left: name.x, top: name.y }}>
          {name.text}
        </span>
      ))}
    </div>
  );
}
