import { describe, expect, it } from "vitest";
import { pickLanguage } from "./language";

describe("pickLanguage", () => {
  it("gives Malay to a device set to Malay", () => {
    expect(pickLanguage(null, "ms-MY")).toBe("ms");
  });

  it("gives English to a device set to English", () => {
    expect(pickLanguage(null, "en-GB")).toBe("en");
  });

  it("gives Malay to a device set to any other language", () => {
    expect(pickLanguage(null, "id-ID")).toBe("ms");
    expect(pickLanguage(null, undefined)).toBe("ms");
  });

  it("lets a stored choice win over the device language", () => {
    expect(pickLanguage("ms", "en-US")).toBe("ms");
    expect(pickLanguage("en", "ms-MY")).toBe("en");
  });

  it("ignores a stored value that is not ms or en", () => {
    expect(pickLanguage("fr", "en-AU")).toBe("en");
    expect(pickLanguage("", "ms-MY")).toBe("ms");
  });
});
