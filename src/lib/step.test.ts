import { describe, expect, it } from "vitest";
import { isCheck, readPlace, stepHash } from "./step";

describe("readPlace", () => {
  it("reads the rite and the step of an address in a walk", () => {
    expect(readPlace("#tawaf-6")).toEqual({ rite: "tawaf", step: 6 });
    expect(readPlace("#tawaf-15")).toEqual({ rite: "tawaf", step: 15 });
    expect(readPlace("#tawaf-1")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#sai-5")).toEqual({ rite: "sai", step: 5 });
    expect(readPlace("#sai-13")).toEqual({ rite: "sai", step: 13 });
  });

  it("gives step 1 of the same rite to a step outside its walk", () => {
    expect(readPlace("#tawaf-0")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#tawaf-99")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#tawaf-16")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#sai-0")).toEqual({ rite: "sai", step: 1 });
    expect(readPlace("#sai-14")).toEqual({ rite: "sai", step: 1 });
    expect(readPlace("#sai-99")).toEqual({ rite: "sai", step: 1 });
  });

  it("gives step 1 of tawaf to any other address", () => {
    expect(readPlace("#abc")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#semak")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#SAI-5")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#sai-abc")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#sai-")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#sai-5/x")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#tawaf-abc")).toEqual({ rite: "tawaf", step: 1 });
  });

  it("gives step 1 to an address that only looks like a step", () => {
    expect(readPlace("#tawaf-06")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#tawaf-6x")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#tawaf-1e1")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#tawaf- 6")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#sai-05")).toEqual({ rite: "sai", step: 1 });
    expect(readPlace("#sai-6x")).toEqual({ rite: "tawaf", step: 1 });
  });
});

describe("stepHash", () => {
  it("gives the address part of a step", () => {
    expect(stepHash("tawaf", 7)).toBe("#tawaf-7");
    expect(stepHash("sai", 5)).toBe("#sai-5");
  });
});

describe("isCheck", () => {
  it("opens the check at #semak only", () => {
    expect(isCheck("#semak")).toBe(true);
    expect(isCheck("#semak-4")).toBe(false);
    expect(isCheck("#SEMAK")).toBe(false);
    expect(isCheck("#tawaf-15")).toBe(false);
    expect(isCheck("")).toBe(false);
  });
});
