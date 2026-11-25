import { describe, expect, it } from "vitest";
import { BIRALI, IHRAM_SPOTS } from "./birali";
import type { Point } from "./mataf";

const inside = ([x, y]: Point, [cx, cy]: number[], width: number, depth: number) =>
  Math.abs(x - cx) < width / 2 && Math.abs(y - cy) < depth / 2;
const { mosque, court, washrooms, busPark } = BIRALI;
const at = (step: number) => IHRAM_SPOTS[step - 1].at!;

describe("the spots of the ihram walk", () => {
  it("has a spot for each of the 8 steps", () => {
    expect(IHRAM_SPOTS).toHaveLength(8);
  });

  it("shows the four names and no marker on step 1 (D91)", () => {
    expect(IHRAM_SPOTS[0].at).toBeNull();
    expect(IHRAM_SPOTS[0].names).toEqual(["hall", "minaret", "washrooms", "busPark"]);
  });

  it("stands beside the washrooms on steps 2 and 3, outside the block", () => {
    for (const step of [2, 3]) {
      expect(inside(at(step), washrooms.at, washrooms.width + 8, washrooms.depth)).toBe(true);
      expect(inside(at(step), washrooms.at, washrooms.width, washrooms.depth)).toBe(false);
    }
  });

  it("stands in the prayer hall on step 4, out of the courtyard", () => {
    expect(inside(at(4), mosque.at, mosque.size, mosque.size)).toBe(true);
    expect(inside(at(4), court.at, court.size, court.size)).toBe(false);
  });

  it("stands in the courtyard on step 5", () => {
    expect(inside(at(5), court.at, court.size, court.size)).toBe(true);
  });

  it("stands in the bus park on steps 6, 7 and 8", () => {
    for (const step of [6, 7, 8]) expect(inside(at(step), busPark.at, busPark.width, busPark.depth)).toBe(true);
  });
});
