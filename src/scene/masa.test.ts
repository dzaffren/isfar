import { describe, expect, it } from "vitest";
import { MASA, groundAt } from "./masa";

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
