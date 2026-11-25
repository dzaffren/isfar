import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { BARRIER, LANES } from "./masa";
import { laneLines } from "./place";

const WAYS = ["marwah", "safa"] as const;

describe("laneLines", () => {
  // The gold material draws only the front of a face, so each triangle of a path line must face up to the camera.
  it("turns each triangle up, on the walk towards Marwah and on the walk back towards Safa", () => {
    for (const towards of WAYS) {
      const points = laneLines(towards).getAttribute("position");
      for (let first = 0; first < points.count; first += 3) {
        const [a, b, c] = [0, 1, 2].map((index) => new Vector3().fromBufferAttribute(points, first + index));
        const up = new Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).y;
        expect(up, `towards ${towards}, triangle ${first / 3}`).toBeGreaterThan(0);
      }
    }
  });

  // three.js has z towards the viewer, so the plan's y is -z.
  it("draws the dashes and the arrows in the lane of the walk, between the barrier ends", () => {
    for (const towards of WAYS) {
      const lane = towards === "marwah" ? LANES.toMarwah : LANES.toSafa;
      const points = laneLines(towards).getAttribute("position");
      for (let index = 0; index < points.count; index += 1) {
        const x = points.getX(index);
        if (x <= BARRIER.from + 1 || x >= BARRIER.to - 1) continue;
        expect(Math.abs(-points.getZ(index) - lane), `towards ${towards}, point ${index}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
