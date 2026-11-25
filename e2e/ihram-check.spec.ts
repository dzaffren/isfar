import { expect, test, type Page } from "@playwright/test";
import { IHRAM_CHECK } from "../src/content/check";
import { IHRAM_SPOTS } from "../src/scene/birali";
import { SIZES, answerTo as answerQuestions, expectBeads, expectCamera, expectNotices, markerAt, names, noWebGL, pickOf as pickAnswer, scene, title } from "./helpers";

const MS = {
  start: "Mula semakan",
  startAgain: "Mula semula",
  goTawaf: "Teruskan ke tawaf",
  next: "Seterusnya",
  leave: "Keluar",
  again: "Cuba semula",
  right: "Betul.",
  wrong: "Belum tepat.",
  no3d: "Peranti ini tidak dapat memaparkan tempat 3D.",
};

// The four names of Bir Ali, which show on question 1 after the answer.
const PLACES = /Dewan solat|Menara|Bilik mandi|Tempat letak bas/;

const next = (page: Page) => page.getByRole("button", { name: MS.next, exact: true });
const options = (page: Page) => page.locator(".vh-option");
const option = (page: Page, text: string) => page.getByRole("button", { name: text, exact: true });
const header = (page: Page) => page.locator(".vh-panel .vh-panel__where");
const line = (page: Page) => page.locator(".vh-result");
const rite = (page: Page, name: string) => page.getByRole("group", { name: /^(Ibadah|Rite)$/ }).getByRole("button", { name, exact: true });
const pickOf = (number: number, wrong: number[] = []) => pickAnswer(IHRAM_CHECK.ms, number, wrong);
const answerTo = (page: Page, last: number) => answerQuestions(page, IHRAM_CHECK.ms, last);

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size, locale: "ms-MY" });

    test("Aminah finishes the ihram walk and checks what she learned", async ({ page }) => {
      await page.goto("/#ihram-8");
      await expect(title(page)).toHaveText("Ke Makkah");
      await expect(page.locator(".walk__actions").getByRole("button", { name: MS.start })).toBeVisible();
      await expect(page.locator(".vh-panel").getByRole("button", { name: MS.goTawaf })).toBeVisible();
      await expect(page.locator(".vh-panel").getByRole("button", { name: MS.startAgain })).toBeVisible();
      await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });

      await page.getByRole("button", { name: MS.start }).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#semak-ihram$/);
      await expect(options(page).first(), "the focus moves into the check").toBeFocused();
      await expect(header(page)).toHaveText("Semakan ihram · Soalan 1 daripada 7");
      await expect(rite(page, "Ihram")).toHaveAttribute("aria-pressed", "true");
      await expectBeads(page, 0, 1);
      await expectCamera(page, 1);
      await expect(names(page)).toHaveCount(0);
      const canvas = page.locator("[data-scene] canvas");
      await expect(canvas, "a screen reader hears no place name before the pick").not.toHaveAttribute("aria-label", PLACES);
      await expect(title(page)).toHaveText("Siapakah yang berihram di Bir Ali?");
      await expect(options(page)).toHaveCount(3);
      await expect(next(page)).toHaveAttribute("aria-disabled", "true");
      await expectNotices(page);

      const right = option(page, "Jemaah yang datang dari Madinah");
      await right.click();
      await expect(right).toHaveClass(/vh-option--right/);
      await expect(line(page)).toContainText(MS.right);
      await expect(option(page, "Jemaah yang terbang terus ke Jeddah")).toHaveAttribute("aria-disabled", "true");
      await expect(names(page)).toHaveCount(4);
      await expect(next(page)).not.toHaveAttribute("aria-disabled", "true");

      await next(page).click();
      await expect(header(page)).toHaveText("Semakan ihram · Soalan 2 daripada 7");
      await expect(options(page).first()).toBeFocused();
      await option(page, pickOf(2, [2])).click();
      await next(page).click();
      await expectCamera(page, 3);
      await expect(names(page)).toHaveCount(0);

      for (let number = 3; number <= 7; number += 1) {
        await expect(title(page)).toHaveText(IHRAM_CHECK.ms[number - 1].ask);
        await option(page, pickOf(number)).click();
        // The courtyard of question 5 has no name, so no name shows after the answer (ihram O23).
        if (number === 5) await expect(names(page)).toHaveCount(0);
        await next(page).click();
      }
      await expect(title(page)).toHaveText("6 daripada 7 betul");
      await expect(header(page)).toHaveText("Semakan ihram · Selesai");
      await expect(page.getByText("Ulang kaji langkah ini:", { exact: true })).toBeVisible();
      await expectBeads(page, 7, null);
      await expectCamera(page, 8);

      await page.getByRole("button", { name: "Langkah 2 · Sebelum ihram" }).click();
      await expect(page).toHaveURL(/#ihram-2$/);
      await expect(title(page)).toHaveText("Sebelum ihram");
    });
  });
}

test.describe("scent on the cloth", () => {
  test.use({ viewport: SIZES[0], locale: "ms-MY" });

  test("Aminah puts the scent on the cloth, then leaves the check", async ({ page }) => {
    await page.goto("/#semak-ihram");
    await answerTo(page, 1);
    await expect(title(page)).toHaveText("Selepas mandi sunat ihram, di mana anda sapu wangian?");
    const wrong = option(page, "Pada kain ihram");
    await wrong.click();
    await expect(wrong).toHaveClass(/vh-option--wrong/);
    await expect(wrong.locator("svg")).toBeAttached();
    await expect(option(page, "Pada badan sahaja")).toHaveClass(/vh-option--right/);
    await expect(line(page)).toHaveText(`${MS.wrong} ${IHRAM_CHECK.ms[1].why}`);
    for (const each of await options(page).all()) await expect(each).toHaveAttribute("aria-disabled", "true");

    await page.getByRole("button", { name: MS.leave }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#ihram-8$/);
    await expect(title(page)).toHaveText("Ke Makkah");
    await expect(page.getByRole("button", { name: MS.start }), "the focus moves to the walk's bar").toBeFocused();
  });
});

test.describe("a projector", () => {
  test.use({ viewport: SIZES[3], locale: "en-GB" });

  test("Ustaz Hafiz runs the ihram check for a class", async ({ page }) => {
    const loads = { birali: 0, masa: 0 };
    page.on("request", (request) => {
      if (request.url().endsWith("/models/birali.glb")) loads.birali += 1;
      if (request.url().endsWith("/models/masa.glb")) loads.masa += 1;
    });
    await page.goto("/#ihram-8");
    await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
    await page.keyboard.press("PageDown");
    await expect(page).toHaveURL(/#semak-ihram$/);
    await expect(title(page)).toHaveText("Who enters ihram at Bir Ali?");
    await expect(header(page)).toHaveText("Ihram check · Question 1 of 7");

    await page.keyboard.press("PageDown");
    await expect(title(page)).toHaveText("Who enters ihram at Bir Ali?");
    await option(page, "Pilgrims who come from Madinah").click();
    await page.keyboard.press("PageDown");
    await expect(title(page)).toHaveText("After the sunnah bath of ihram, where do you put scent?");

    await option(page, "On the ihram cloth").click();
    await page.getByRole("button", { name: "BM" }).click();
    await expect(title(page)).toHaveText("Selepas mandi sunat ihram, di mana anda sapu wangian?");
    await expect(option(page, "Pada kain ihram")).toHaveClass(/vh-option--wrong/);
    await expect(scene(page)).toHaveAttribute("data-state", "shown");
    expect(loads.birali).toBe(1);

    await page.reload();
    await expect(title(page)).toHaveText("Siapakah yang berihram di Bir Ali?");
    await expect(page.locator('.vh-option[aria-pressed="true"]')).toHaveCount(0);

    await answerTo(page, 1);
    await rite(page, "Tawaf").click();
    await expect(page).toHaveURL(/#tawaf-1$/);
    await expect(rite(page, "Tawaf")).toHaveAttribute("aria-pressed", "true");

    await page.goto("/#semak-sai");
    await expect(title(page)).toHaveText("Di mana sa'i bermula?");
    await expect(header(page)).toHaveText("Semakan sa'i · Soalan 1 daripada 7");
    await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
    expect(loads.masa).toBeGreaterThan(0);
  });
});

test.describe("no 3D", () => {
  test.use({ viewport: SIZES[0], locale: "ms-MY" });

  test("the ihram check still works when the device cannot draw 3D", async ({ page }) => {
    await page.addInitScript(noWebGL);
    await page.goto("/#semak-ihram");
    await expect(scene(page)).toHaveAttribute("data-state", "unsupported");
    const map = page.locator("[data-still]");
    await expect(map).toBeVisible();
    await expect(map.locator("[data-marker]"), "question 1 shows the wide view, with no marker").toHaveCount(0);
    await expect(map.locator(".scene__name")).toHaveCount(0);
    await expect(map, "a screen reader hears no place name before the pick").not.toHaveAttribute("aria-label", PLACES);
    await expect(page.getByText(MS.no3d, { exact: true })).toBeVisible();

    await option(page, pickOf(1)).click();
    await expect(map.locator(".scene__name")).toHaveCount(4);
    await next(page).click();
    expect(await markerAt(page), "the marker stands at the washrooms").toEqual(IHRAM_SPOTS[1].at!.map((value) => expect.closeTo(value, 1)));

    for (let number = 2; number <= 7; number += 1) {
      await option(page, pickOf(number)).click();
      await next(page).click();
    }
    await expect(title(page)).toHaveText("7 daripada 7 betul");

    await page.getByRole("button", { name: MS.again }).click();
    await expect(title(page)).toHaveText(IHRAM_CHECK.ms[0].ask);
    await expect(page.locator('.vh-option[aria-pressed="true"]')).toHaveCount(0);
  });
});
