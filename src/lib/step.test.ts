import { describe, expect, it } from "vitest";
import { CHECK_HASH, isCheck, readPlace, stepHash } from "./step";

describe("readPlace", () => {
  it("reads the rite and the step of an address in a walk", () => {
    expect(readPlace("#tawaf-6")).toEqual({ rite: "tawaf", step: 6 });
    expect(readPlace("#tawaf-15")).toEqual({ rite: "tawaf", step: 15 });
    expect(readPlace("#tawaf-1")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#sai-5")).toEqual({ rite: "sai", step: 5 });
    expect(readPlace("#sai-13")).toEqual({ rite: "sai", step: 13 });
    expect(readPlace("#tawaf-16")).toEqual({ rite: "tawaf", step: 16 });
  });

  it("gives step 1 of the same rite to a step outside its walk", () => {
    expect(readPlace("#tawaf-0")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#tawaf-99")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#tawaf-17")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#sai-0")).toEqual({ rite: "sai", step: 1 });
    expect(readPlace("#sai-14")).toEqual({ rite: "sai", step: 1 });
    expect(readPlace("#sai-99")).toEqual({ rite: "sai", step: 1 });
  });

  it("gives step 1 of ihram to any other address", () => {
    expect(readPlace("#abc")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#semak")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#SEMAK-SAI")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#semak-sai-2")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#sai-semak")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#SAI-5")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#sai-abc")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#sai-")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#sai-5/x")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#tawaf-abc")).toEqual({ rite: "ihram", step: 1 });
  });

  it("gives step 1 to an address that only looks like a step", () => {
    expect(readPlace("#tawaf-06")).toEqual({ rite: "tawaf", step: 1 });
    expect(readPlace("#tawaf-6x")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#tawaf-1e1")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#tawaf- 6")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#sai-05")).toEqual({ rite: "sai", step: 1 });
    expect(readPlace("#sai-6x")).toEqual({ rite: "ihram", step: 1 });
  });
});

describe("the address of an ihram step", () => {
  it("reads #ihram-1 to #ihram-8", () => {
    for (let step = 1; step <= 8; step += 1) expect(readPlace(`#ihram-${step}`)).toEqual({ rite: "ihram", step });
    expect(stepHash("ihram", 5)).toBe("#ihram-5");
  });

  it("gives step 1 of ihram to a step outside its walk", () => {
    expect(readPlace("#ihram-0")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#ihram-9")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#ihram-12")).toEqual({ rite: "ihram", step: 1 });
  });

  it("gives step 1 of ihram to an address that only looks like ihram", () => {
    expect(readPlace("#IHRAM-2")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#ihram")).toEqual({ rite: "ihram", step: 1 });
    expect(isCheck("#ihram-8")).toBe(false);
  });
});

describe("the address of a check", () => {
  it("reads #semak-sai as the sa'i check", () => {
    expect(readPlace("#semak-sai")).toEqual({ rite: "sai", step: 1 });
    expect(isCheck("#semak-sai")).toBe(true);
    expect(CHECK_HASH).toEqual({ ihram: "#semak-ihram", tawaf: "#semak", sai: "#semak-sai" });
  });

  it("reads no other address as the sa'i check", () => {
    expect(isCheck("#SEMAK-SAI")).toBe(false);
    expect(isCheck("#semak-sai-2")).toBe(false);
    expect(isCheck("#sai-semak")).toBe(false);
    expect(isCheck("#sai-13")).toBe(false);
  });

  it("reads #semak-ihram as the ihram check", () => {
    expect(readPlace("#semak-ihram")).toEqual({ rite: "ihram", step: 1 });
    expect(isCheck("#semak-ihram")).toBe(true);
  });

  it("reads no other address as the ihram check", () => {
    for (const hash of ["#SEMAK-IHRAM", "#semak-ihram-2", "#ihram-semak"]) {
      expect(readPlace(hash)).toEqual({ rite: "ihram", step: 1 });
      expect(isCheck(hash)).toBe(false);
    }
  });
});

describe("the address of a tahallul step", () => {
  it("reads #tahallul-1 and #tahallul-2", () => {
    expect(readPlace("#tahallul-1")).toEqual({ rite: "tahallul", step: 1 });
    expect(readPlace("#tahallul-2")).toEqual({ rite: "tahallul", step: 2 });
    expect(stepHash("tahallul", 2)).toBe("#tahallul-2");
  });

  it("gives step 1 of tahallul to a step outside its walk", () => {
    expect(readPlace("#tahallul-0")).toEqual({ rite: "tahallul", step: 1 });
    expect(readPlace("#tahallul-5")).toEqual({ rite: "tahallul", step: 1 });
  });

  it("has no check", () => {
    expect(isCheck("#semak-tahallul")).toBe(false);
    expect(readPlace("#semak-tahallul")).toEqual({ rite: "ihram", step: 1 });
    expect(readPlace("#umrah")).toEqual({ rite: "ihram", step: 1 });
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
