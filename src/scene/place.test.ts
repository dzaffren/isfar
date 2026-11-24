import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { hallLine } from "./place";

// The gold material draws only the front of a face, so each triangle of a path line must face up to the camera.
describe("hallLine", () => {
  it("turns each triangle up, on the walk towards Marwah and on the walk back towards Safa", () => {
    for (const way of [1, -1] as const) {
      const points = hallLine(way).getAttribute("position");
      for (let first = 0; first < points.count; first += 3) {
        const [a, b, c] = [0, 1, 2].map((index) => new Vector3().fromBufferAttribute(points, first + index));
        const up = new Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).y;
        expect(up, `way ${way}, triangle ${first / 3}`).toBeGreaterThan(0);
      }
    }
  });
});
