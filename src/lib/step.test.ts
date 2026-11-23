import { describe, expect, it } from "vitest";
import { readStep, stepHash } from "./step";

describe("readStep", () => {
  it("reads the step of an address in the walk", () => {
    expect(readStep("#tawaf-6", 15)).toBe(6);
    expect(readStep("#tawaf-15", 15)).toBe(15);
    expect(readStep("#tawaf-1", 15)).toBe(1);
  });

  it("gives step 1 to an address outside the walk", () => {
    expect(readStep("#tawaf-0", 15)).toBe(1);
    expect(readStep("#tawaf-99", 15)).toBe(1);
    expect(readStep("#tawaf-16", 15)).toBe(1);
    expect(readStep("#abc", 15)).toBe(1);
    expect(readStep("", 15)).toBe(1);
  });

  it("gives step 1 to an address that only looks like a step", () => {
    expect(readStep("#tawaf-06", 15)).toBe(1);
    expect(readStep("#tawaf-6x", 15)).toBe(1);
    expect(readStep("#tawaf-1e1", 15)).toBe(1);
    expect(readStep("#tawaf- 6", 15)).toBe(1);
  });
});

describe("stepHash", () => {
  it("gives the address part of a step", () => {
    expect(stepHash(7)).toBe("#tawaf-7");
  });
});
