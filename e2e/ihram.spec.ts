import { expect, test, type Page } from "@playwright/test";
import { BIRALI } from "../src/scene/birali";
import { SIZES, expectApart, expectCamera, expectNotices, markerAt, modelParts, names, noWebGL, scene, title } from "./helpers";

const MS = {
  no3d: "Peranti ini tidak dapat memaparkan tempat 3D.",
  next: "Seterusnya",
  back: "Kembali",
  startAgain: "Mula semula",
  goTawaf: "Teruskan ke tawaf",
};

const next = (page: Page) => page.getByRole("button", { name: MS.next, exact: true });
const rite = (page: Page, name: string) => page.getByRole("group", { name: /^(Ibadah|Rite)$/ }).getByRole("button", { name, exact: true });
const label = (page: Page) => page.locator(".vh-panel .vh-panel__where");

async function tapNext(page: Page, times: number) {
  for (let tap = 0; tap < times; tap += 1) await next(page).click();
}

// On the map, no name covers the gold marker.
async function expectMarkerClear(page: Page) {
  const marker = (await page.locator("[data-marker]").boundingBox())!;
  for (const name of await names(page).all()) {
    const box = (await name.boundingBox())!;
    const apart = box.x + box.width <= marker.x || marker.x + marker.width <= box.x || box.y + box.height <= marker.y || marker.y + marker.height <= box.y;
    expect(apart, `the name "${await name.innerText()}" stays clear of the marker`).toBe(true);
  }
}

// The contrast of two fills on the map, by the WCAG formula.
async function contrast(page: Page, one: string, two: string) {
  const fills = await page.evaluate(
    (selectors) => selectors.map((selector) => getComputedStyle(document.querySelector(selector)!).fill.match(/\d+/g)!.slice(0, 3).map(Number)),
    [one, two],
  );
  const [a, b] = fills.map((rgb) => {
    const [r, g, bl] = rgb.map((value) => (value / 255 <= 0.03928 ? value / 255 / 12.92 : ((value / 255 + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  });
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const inside = ([x, y]: [number, number], [cx, cy]: number[], width: number, depth: number) => Math.abs(x - cx) < width / 2 && Math.abs(y - cy) < depth / 2;

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size, locale: "ms-MY" });

    test("Aminah walks through ihram in Bir Ali", async ({ page }) => {
      await page.goto("/#tawaf-3");
      await expect(title(page)).toHaveText("Tempat mula");
      const bar = page.locator(".topbar");
      expect(await bar.evaluate((node) => node.scrollWidth <= node.clientWidth), "the top bar fits the screen").toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "the page does not scroll sideways").toBe(true);
      await expect(page.getByRole("group", { name: "Ibadah" }).getByRole("button")).toHaveText(["Ihram", "Tawaf", "Sa'i"]);
      // Tab follows the page order, so each button of the bar comes after the one before it: on the same row to its right, or on a lower row.
      const order = await Promise.all((await bar.getByRole("button").all()).map(async (button) => (await button.boundingBox())!));
      for (let index = 1; index < order.length; index += 1) {
        const [before, now] = [order[index - 1], order[index]];
        expect(now.y > before.y + before.height / 2 || (Math.abs(now.y - before.y) < 1 && now.x > before.x), `button ${index + 1} of the top bar follows button ${index}`).toBe(true);
      }

      await rite(page, "Ihram").click();
      await expect(page).toHaveURL(/#ihram-1$/);
      await expect(label(page)).toHaveText("Ihram · Langkah 1 daripada 8");
      await expect(title(page)).toHaveText("Bir Ali dan bahagiannya");
      await expect(rite(page, "Ihram")).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".vh-panel .vh-bead")).toHaveCount(0);
      await expectNotices(page);
      await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
      await expectCamera(page, 1);
      expect(await modelParts(page, "birali")).toEqual(expect.arrayContaining(["floor", "park", "hall", "court", "minaret", "washrooms"]));
      await expect(names(page)).toHaveText(["Dewan solat", "Menara", "Bilik mandi", "Tempat letak bas"], { useInnerText: true });
      const frame = (await page.locator(".scene__frame").boundingBox())!;
      const boxes = await Promise.all((await names(page).all()).map(async (name) => (await name.boundingBox())!));
      for (const box of boxes) {
        expect(box.x).toBeGreaterThanOrEqual(frame.x);
        expect(box.x + box.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
      }
      expectApart(boxes);
      await expect(page.getByRole("button", { name: MS.back })).toHaveCount(0);

      await tapNext(page, 1);
      await expect(title(page)).toHaveText("Sebelum ihram");
      await expectCamera(page, 2);
      await expect(names(page)).toHaveText(["Bilik mandi"], { useInnerText: true });

      await tapNext(page, 2);
      await expect(title(page)).toHaveText("Solat sunat ihram");
      await expectCamera(page, 4);
      await expect(names(page)).toHaveText(["Dewan solat"], { useInnerText: true });

      await tapNext(page, 1);
      await expect(title(page)).toHaveText("Niat umrah");
      await expect(page.getByText("Nawaitul 'umrata wa ahramtu biha lillahi ta'ala", { exact: true })).toBeVisible();
      await expect(page.locator(".vh-arabic__meaning")).toHaveText(/^Aku berniat umrah/);
      await expect(page.getByText(/berniat dalam kapal terbang sebelum miqat/)).toBeVisible();
      await expectCamera(page, 5);

      await tapNext(page, 1);
      await expect(title(page)).toHaveText("Talbiyah");
      await expect(page.getByText(/^Labbaik Allahumma labbaik/)).toBeVisible();
      await expect(names(page)).toHaveText(["Tempat letak bas"], { useInnerText: true });
      await expectCamera(page, 6);

      await tapNext(page, 2);
      await expect(title(page)).toHaveText("Ke Makkah");
      await expectCamera(page, 8);
      await expect(next(page)).toHaveCount(0);
      await expect(page.locator(".vh-panel").getByRole("button", { name: MS.startAgain })).toBeVisible();
      await page.locator(".walk__actions").getByRole("button", { name: MS.goTawaf }).click();
      await expect(page).toHaveURL(/#tawaf-1$/);
      await expect(title(page)).toHaveText("Kaabah dan bahagiannya");
      await expect(rite(page, "Tawaf")).toHaveAttribute("aria-pressed", "true");
      await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
    });

    test("Aminah sees the top-view map of Bir Ali when the 3D place cannot show", async ({ page }) => {
      await page.addInitScript(noWebGL);
      let modelAsked = false;
      page.on("request", (request) => {
        if (request.url().endsWith("/models/birali.glb")) modelAsked = true;
      });
      await page.goto("/#ihram-2");
      await expect(title(page)).toHaveText("Sebelum ihram");
      await expect(scene(page)).toHaveAttribute("data-state", "unsupported");
      const map = page.locator("[data-still]");
      for (const part of ["hall", "court", "minaret", "block", "park"]) await expect(map.locator(`.map__${part}`)).toHaveCount(1);
      await expect(names(page)).toHaveText(["Bilik mandi"], { useInnerText: true });
      const { washrooms, mosque, court } = BIRALI;
      const atWashrooms = await markerAt(page);
      expect(inside(atWashrooms, washrooms.at, washrooms.width + 8, washrooms.depth), "the marker is beside the washrooms").toBe(true);
      expect(inside(atWashrooms, washrooms.at, washrooms.width, washrooms.depth), "the marker is outside the block").toBe(false);
      await expectMarkerClear(page);
      const message = page.getByText(MS.no3d, { exact: true });
      await expect(message).toBeVisible();
      expect((await message.boundingBox())!.y, "the message sits under the step panel").toBeGreaterThan((await page.locator(".vh-panel").boundingBox())!.y);

      await tapNext(page, 2);
      await expect(title(page)).toHaveText("Solat sunat ihram");
      const inHall = await markerAt(page);
      expect(inside(inHall, mosque.at, mosque.size, mosque.size), "the marker is in the mosque").toBe(true);
      expect(inside(inHall, court.at, court.size, court.size), "the marker is out of the courtyard").toBe(false);
      await expect(names(page)).toHaveText(["Dewan solat"], { useInnerText: true });
      await expectMarkerClear(page);
      expect(modelAsked).toBe(false);
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        expect(await contrast(page, ".map__minaret", ".map__hall"), `the minaret stands out from the hall in ${colorScheme} mode`).toBeGreaterThanOrEqual(3);
      }
    });

    test("an ihram address outside the walk opens step 1", async ({ page }) => {
      await page.goto("/#ihram-12");
      await expect(title(page)).toHaveText("Bir Ali dan bahagiannya");
      await expect(label(page)).toHaveText("Ihram · Langkah 1 daripada 8");
      await page.goto("/#ihram-0");
      await expect(title(page)).toHaveText("Bir Ali dan bahagiannya");
      await expect(rite(page, "Ihram")).toHaveAttribute("aria-pressed", "true");
    });
  });
}

test.describe("1920x1080 projector, in English", () => {
  test.use({ viewport: { width: 1920, height: 1080 }, locale: "en-GB" });

  test("Ustaz Hafiz teaches ihram on a projector with a clicker", async ({ page }) => {
    await page.goto("/#ihram-4");
    await expect(title(page)).toHaveText("Solat sunat ihram");
    await expect(label(page)).toHaveText("Ihram · Step 4 of 8");
    await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
    await expectCamera(page, 4);

    await page.keyboard.press("PageDown");
    await expect(page).toHaveURL(/#ihram-5$/);
    await expect(title(page)).toHaveText("The niat of umrah");
    await expectCamera(page, 5);

    await page.reload();
    await expect(title(page)).toHaveText("The niat of umrah");

    // Each press waits for its step, as a presenter waits for the screen, so no press goes to the step before it.
    for (const step of [6, 7, 8]) {
      await page.keyboard.press("PageDown");
      await expect(page).toHaveURL(new RegExp(`#ihram-${step}$`));
    }
    await expect(title(page)).toHaveText("On to Makkah");
    await expect(page.locator(".walk__actions").getByRole("button", { name: "Go on to tawaf" })).toBeVisible();

    await page.keyboard.press("PageDown");
    await expect(page).toHaveURL(/#tawaf-1$/);
    await expect(title(page)).toHaveText("The Kaabah and its parts");

    await page.goBack();
    await expect(page).toHaveURL(/#ihram-8$/);
    await expect(title(page)).toHaveText("On to Makkah");
  });
});
