import { describe, expect, it } from "vitest";
import { SPOTS } from "./mataf";
import { between, viewOf, type View } from "./views";

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
