import { describe, expect, it } from "vitest";
import { SPOTS } from "./mataf";
import plan from "./plan.json" with { type: "json" };
import { between, viewOf, type V3, type View } from "./views";

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
