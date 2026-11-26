import { describe, expect, it } from "vitest";
import { BARRIER, LANES, MASA, SAI_SPOTS, TAHALLUL_SPOTS, WALK, groundAt, laneLine } from "./masa";

describe("groundAt", () => {
  const { safa, marwah } = MASA;

  it("stands at the top of each hill over its centre", () => {
    expect(groundAt([safa.at[0], safa.at[1]])).toBeCloseTo(safa.height);
    expect(groundAt([marwah.at[0], marwah.at[1]])).toBeCloseTo(marwah.height);
  });

  it("falls on the slope, towards the edge of the hill", () => {
    const halfway = groundAt([safa.at[0] + safa.radius / 2, 0]);
    expect(halfway).toBeGreaterThan(0);
    expect(halfway).toBeLessThan(safa.height);
    expect(groundAt([safa.at[0] + safa.radius * 0.9, 0])).toBeLessThan(halfway);
  });

  it("is the floor at the edge of each hill and between the hills", () => {
    expect(groundAt([safa.at[0] + safa.radius, 0])).toBe(0);
    expect(groundAt([marwah.at[0] - marwah.radius, 0])).toBe(0);
    expect(groundAt([0, 0])).toBe(0);
    expect(groundAt([MASA.walk.from, 0])).toBe(0);
    expect(groundAt([MASA.walk.to, 0])).toBe(0);
  });
});

describe("laneLine", () => {
  it("runs from the foot of Safa, along the lane to Marwah between the barrier ends, to the foot of Marwah", () => {
    expect(laneLine("marwah")).toEqual([
      [WALK.from, 0],
      [BARRIER.from, LANES.toMarwah],
      [BARRIER.to, LANES.toMarwah],
      [WALK.to, 0],
    ]);
  });

  it("runs back from the foot of Marwah, along the lane to Safa", () => {
    expect(laneLine("safa")).toEqual([
      [WALK.to, 0],
      [BARRIER.to, LANES.toSafa],
      [BARRIER.from, LANES.toSafa],
      [WALK.from, 0],
    ]);
  });

  it("keeps each lane on its own side of the barrier, inside the walls", () => {
    expect(Math.sign(LANES.toMarwah)).toBe(-Math.sign(LANES.toSafa));
    for (const y of [LANES.toMarwah, LANES.toSafa]) expect(Math.abs(y)).toBeLessThan(MASA.width / 2);
  });

  it("stops the barrier short of each hill, so the floor at the hill is open across the hall", () => {
    expect(BARRIER.from).toBeGreaterThan(WALK.from);
    expect(BARRIER.to).toBeLessThan(WALK.to);
  });
});

describe("the spots of the sa'i walk", () => {
  it("stands steps 4 and 5 in the lane to Marwah", () => {
    expect(SAI_SPOTS[3].at![1]).toBe(LANES.toMarwah);
    expect(SAI_SPOTS[4].at![1]).toBe(LANES.toMarwah);
  });
});

describe("the spot of tahallul", () => {
  // tools/masa.py runs the floor 16 m past each end of the hall (D116).
  const FLOOR_END = MASA.length / 2 + 16;
  const [x, y] = TAHALLUL_SPOTS[0].at!;

  it("stands past the Marwah rock, with the whole marker disc on flat floor", () => {
    for (const dx of [-1.5, 0, 1.5]) expect(groundAt([x + dx, y])).toBe(0);
    expect(x - 1.5).toBeGreaterThan(MASA.marwah.at[0] + MASA.marwah.radius);
    expect(x + 1.5).toBeLessThan(FLOOR_END);
  });

  it("keeps the same spot on both steps", () => {
    expect(TAHALLUL_SPOTS[1].at).toEqual(TAHALLUL_SPOTS[0].at);
  });
});
