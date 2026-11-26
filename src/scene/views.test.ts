import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { IHRAM_SPOTS } from "./birali";
import { SAI_SPOTS, TAHALLUL_SPOTS, groundAt, laneLine } from "./masa";
import { SPOTS } from "./mataf";
import plan from "./plan.json" with { type: "json" };
import { alongHall, between, birAliNameAnchor, birAliViewOf, masaViewOf, saiNameAnchor, viewOf, type V3, type View } from "./views";

// The scene is about square on a projector at 960x540, and 1.5 times as wide as it is high on a phone.
const onScreen = (view: View, aspect: number, [x, y, z]: V3) => {
  const camera = new PerspectiveCamera(40, aspect, 1, 1000);
  camera.position.set(view.from[0], view.from[2], -view.from[1]);
  camera.lookAt(view.to[0], view.to[2], -view.to[1]);
  camera.updateMatrixWorld();
  const point = new Vector3(x, z, -y).project(camera);
  return point.z < 1 && Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1;
};

const STEPS = SPOTS.length;
const across = (view: View) => Math.hypot(view.from[0], view.from[1]);

// Each move that the walk can make: Next, Back, and Start again from the last step.
const MOVES: [number, number][] = [];
for (let step = 1; step < STEPS; step += 1) MOVES.push([step, step + 1], [step + 1, step]);
MOVES.push([STEPS, 1]);

describe("between", () => {
  it("starts at the first view and ends at the second", () => {
    const one = viewOf(5);
    const two = viewOf(6);
    for (let axis = 0; axis < 3; axis += 1) {
      expect(between(one, two, 0).from[axis]).toBeCloseTo(one.from[axis]);
      expect(between(one, two, 0).to[axis]).toBeCloseTo(one.to[axis]);
      expect(between(one, two, 1).from[axis]).toBeCloseTo(two.from[axis]);
      expect(between(one, two, 1).to[axis]).toBeCloseTo(two.to[axis]);
    }
  });

  it("keeps the camera 9 m or more from the centre of the Kaabah on each move", () => {
    for (const [from, to] of MOVES) {
      for (let t = 0; t <= 1; t += 0.01) {
        expect(across(between(viewOf(from), viewOf(to), t)), `step ${from} to step ${to}, at ${t.toFixed(2)}`).toBeGreaterThanOrEqual(9);
      }
    }
  });
});

describe("viewOf", () => {
  // The ring of arcades: a wall at the radius, and a roof out to radius + roof, at its height.
  const { radius, roof, height } = plan.ring;
  const inArcade = ([x, y, z]: V3) => z < height && Math.hypot(x, y) >= radius && Math.hypot(x, y) <= radius + roof;

  it("sees the marker of each step, with no arcade in the way", () => {
    SPOTS.forEach((spot, index) => {
      if (!spot.at) return;
      const { from } = viewOf(index + 1);
      // The disc on the floor, and the pin 3 m up.
      for (const target of [[spot.at[0], spot.at[1], 0], [spot.at[0], spot.at[1], 3]] as V3[]) {
        for (let s = 0; s <= 1; s += 0.005) {
          const at: V3 = [0, 1, 2].map((axis) => target[axis] + (from[axis] - target[axis]) * s) as unknown as V3;
          expect(inArcade(at), `step ${index + 1}, ${target[2]} m up, at ${s.toFixed(3)} of the way to the camera`).toBe(false);
        }
      }
    });
  });
});

const saiViewOf = (step: number) => masaViewOf(SAI_SPOTS[step - 1]);

describe("the camera in the mas'a", () => {
  const { length, height } = plan.masa;
  const END = length / 2 + 10;
  const SAI_STEPS = SAI_SPOTS.length;
  const SAI_MOVES: [number, number][] = [];
  for (let step = 1; step < SAI_STEPS; step += 1) SAI_MOVES.push([step, step + 1], [step + 1, step]);
  SAI_MOVES.push([SAI_STEPS, 1]);

  it("moves on a straight line from the first view to the second", () => {
    const one = saiViewOf(4);
    const two = saiViewOf(5);
    for (let axis = 0; axis < 3; axis += 1) {
      expect(alongHall(one, two, 0).from[axis]).toBeCloseTo(one.from[axis]);
      expect(alongHall(one, two, 1).to[axis]).toBeCloseTo(two.to[axis]);
      expect(alongHall(one, two, 0.5).from[axis]).toBeCloseTo((one.from[axis] + two.from[axis]) / 2);
    }
  });

  it("stays above the walls on each view and on 10 points of each move", () => {
    for (const [from, to] of SAI_MOVES) {
      for (let point = 0; point <= 10; point += 1) {
        const at = alongHall(saiViewOf(from), saiViewOf(to), point / 10).from;
        expect(at[2], `step ${from} to step ${to}, point ${point}`).toBeGreaterThan(height + 1);
      }
    }
  });

  it("stays inside the ends of the hall on each walk view", () => {
    SAI_SPOTS.forEach((spot, index) => {
      if (spot.view === "wide") return;
      const { from } = saiViewOf(index + 1);
      expect(Math.abs(from[0]), `step ${index + 1}`).toBeLessThanOrEqual(END);
      expect(Math.abs(from[1]), `step ${index + 1}`).toBeLessThan(plan.masa.width / 2);
    });
  });

  it("looks from behind the marker towards the way of the view", () => {
    SAI_SPOTS.forEach((spot, index) => {
      if (!spot.at || spot.view === "wide") return;
      const { from, to } = saiViewOf(index + 1);
      const way = spot.view === "marwah" ? 1 : -1;
      expect(Math.sign(spot.at[0] - from[0]), `step ${index + 1}: the camera is behind the marker`).toBe(way);
      expect(Math.sign(to[0] - from[0]), `step ${index + 1}: the camera looks the way of the view`).toBe(way);
    });
  });

  it("looks along the whole hall from behind the hill of the marker on a wide view", () => {
    expect(saiViewOf(1).from[0]).toBeLessThan(-END);
    expect(saiViewOf(13).from[0]).toBeGreaterThan(END);
  });

  it("shows the marker of each step, on a projector and on a phone", () => {
    SAI_SPOTS.forEach((spot, index) => {
      if (!spot.at) return;
      for (const aspect of [1, 1.5]) {
        const marker: V3 = [spot.at[0], spot.at[1], groundAt(spot.at)];
        expect(onScreen(saiViewOf(index + 1), aspect, marker), `step ${index + 1}, aspect ${aspect}`).toBe(true);
      }
    });
  });

  // One point for each metre along the lane path of the walk.
  const alongLane = (towards: "marwah" | "safa") =>
    laneLine(towards).flatMap(([x, y], index, line): V3[] => {
      if (index === 0) return [];
      const [fromX, fromY] = line[index - 1];
      const metres = Math.round(Math.hypot(x - fromX, y - fromY));
      return Array.from({ length: metres }, (_, m) => [fromX + ((x - fromX) * m) / metres, fromY + ((y - fromY) * m) / metres, 0]);
    });

  it("shows 20 m or more of the lane path on each step of a walk, on a projector and on a phone", () => {
    SAI_SPOTS.forEach((spot, index) => {
      if (!spot.towards) return;
      for (const aspect of [1, 1.5]) {
        let shown = 0;
        for (const point of alongLane(spot.towards)) if (onScreen(saiViewOf(index + 1), aspect, point)) shown += 1;
        expect(shown, `step ${index + 1}, aspect ${aspect}`).toBeGreaterThanOrEqual(20);
      }
    });
  });
});

describe("the camera of tahallul in the mas'a", () => {
  const { height } = plan.masa;
  const tahallulViewOf = (step: number) => masaViewOf(TAHALLUL_SPOTS[step - 1]);

  it("stays above the walls on each view and on 10 points of each move", () => {
    for (const [from, to] of [[1, 2], [2, 1]]) {
      for (let point = 0; point <= 10; point += 1) {
        const at = alongHall(tahallulViewOf(from), tahallulViewOf(to), point / 10).from;
        expect(at[2], `step ${from} to step ${to}, point ${point}`).toBeGreaterThan(height + 1);
      }
    }
  });

  it("shows the marker past Marwah, on a projector and on a phone", () => {
    TAHALLUL_SPOTS.forEach((spot, index) => {
      for (const aspect of [1, 1.5]) {
        expect(onScreen(tahallulViewOf(index + 1), aspect, [spot.at![0], spot.at![1], 0]), `step ${index + 1}, aspect ${aspect}`).toBe(true);
      }
    });
  });

  it("shows the name of each part of the step, on a projector and on a phone", () => {
    TAHALLUL_SPOTS.forEach((spot, index) => {
      if (spot.view === "wide") return;
      for (const part of spot.names) {
        for (const aspect of [1, 1.5]) {
          expect(onScreen(tahallulViewOf(index + 1), aspect, saiNameAnchor(part)), `step ${index + 1}, ${part}, aspect ${aspect}`).toBe(true);
        }
      }
    });
  });

  it("sees the marker over the Marwah rock", () => {
    TAHALLUL_SPOTS.forEach((spot, index) => {
      const { from } = tahallulViewOf(index + 1);
      const target: V3 = [spot.at![0], spot.at![1], 0.5];
      for (let s = 0.02; s <= 1; s += 0.02) {
        const [x, y, z] = [0, 1, 2].map((axis) => target[axis] + (from[axis] - target[axis]) * s);
        expect(z, `step ${index + 1}, at ${s.toFixed(2)} of the way to the camera`).toBeGreaterThan(groundAt([x, y]));
      }
    });
  });

  it("looks at the marker from inside the hall on step 1", () => {
    const { from, to } = tahallulViewOf(1);
    expect(from[0]).toBeLessThan(TAHALLUL_SPOTS[0].at![0]);
    expect(to[0]).toBeGreaterThan(from[0]);
  });
});

describe("the camera in Bir Ali", () => {
  const { mosque, court, minaret, washrooms } = plan.birali;
  const STEPS_HERE = IHRAM_SPOTS.length;
  const MOVES_HERE: [number, number][] = [];
  for (let step = 1; step < STEPS_HERE; step += 1) MOVES_HERE.push([step, step + 1], [step + 1, step]);
  MOVES_HERE.push([STEPS_HERE, 1]);

  // The solid parts of the model, as boxes: [west, south, east, north, top], in the plan's metres.
  type Solid = [number, number, number, number, number];
  const walls = (at: number[], size: number): Solid[] => {
    const [x, y] = at;
    const half = size / 2;
    return [
      [x - half, y - half, x + half, y - half + 1, mosque.height],
      [x - half, y + half - 1, x + half, y + half, mosque.height],
      [x - half, y - half, x - half + 1, y + half, mosque.height],
      [x + half - 1, y - half, x + half, y + half, mosque.height],
    ];
  };
  const block = (at: number[], width: number, depth: number, top: number): Solid => [at[0] - width / 2, at[1] - depth / 2, at[0] + width / 2, at[1] + depth / 2, top];
  const SOLIDS: Solid[] = [
    ...walls(mosque.at, mosque.size),
    ...walls(court.at, court.size),
    block(minaret.at, minaret.size, minaret.size, minaret.height),
    block(washrooms.at, washrooms.width, washrooms.depth, washrooms.height),
  ];
  const inSolid = ([x, y, z]: V3) => SOLIDS.some(([west, south, east, north, top]) => x >= west && x <= east && y >= south && y <= north && z <= top);

  it("stays above the walls and clear of the minaret on each view and on 50 points of each move (D101)", () => {
    for (const [from, to] of MOVES_HERE) {
      for (let point = 0; point <= 50; point += 1) {
        const at = alongHall(birAliViewOf(from), birAliViewOf(to), point / 50).from;
        expect(at[2], `step ${from} to step ${to}, point ${point}`).toBeGreaterThan(mosque.height + 1);
        expect(inSolid(at), `step ${from} to step ${to}, point ${point}`).toBe(false);
      }
    }
  });

  it("stands south-west of the marker on each step with a marker", () => {
    IHRAM_SPOTS.forEach((spot, index) => {
      if (!spot.at) return;
      const { from } = birAliViewOf(index + 1);
      expect(from[0], `step ${index + 1}`).toBeLessThan(spot.at[0]);
      expect(from[1], `step ${index + 1}`).toBeLessThan(spot.at[1]);
    });
  });

  it("sees the marker of each step over the walls, with no part of the model in the way", () => {
    IHRAM_SPOTS.forEach((spot, index) => {
      if (!spot.at) return;
      const { from } = birAliViewOf(index + 1);
      // The disc on the floor, and the pin 3 m up.
      for (const target of [[spot.at[0], spot.at[1], 0.1], [spot.at[0], spot.at[1], 3]] as V3[]) {
        for (let s = 0; s <= 1; s += 0.005) {
          const at: V3 = [0, 1, 2].map((axis) => target[axis] + (from[axis] - target[axis]) * s) as unknown as V3;
          expect(inSolid(at), `step ${index + 1}, ${target[2]} m up, at ${s.toFixed(3)} of the way to the camera`).toBe(false);
        }
      }
    });
  });

  it("shows the marker of each step, and each name of the step, on a projector and on a phone", () => {
    IHRAM_SPOTS.forEach((spot, index) => {
      for (const aspect of [1, 1.5]) {
        if (spot.at) expect(onScreen(birAliViewOf(index + 1), aspect, [spot.at[0], spot.at[1], 0]), `step ${index + 1}, aspect ${aspect}`).toBe(true);
        for (const part of spot.names) {
          expect(onScreen(birAliViewOf(index + 1), aspect, birAliNameAnchor(part)), `step ${index + 1}, ${part}, aspect ${aspect}`).toBe(true);
        }
      }
    });
  });
});
