import { expect, test, type Page } from "@playwright/test";
import { SAI_CHECK } from "../src/content/check";
import { SAI_SPOTS } from "../src/scene/masa";
import { SIZES, answerTo as answerQuestions, expectBeads, expectCamera, expectNotices, markerAt, names, noWebGL, pickOf as pickAnswer, scene, title } from "./helpers";

const MS = {
  start: "Mula semakan",
  startAgain: "Mula semula",
  next: "Seterusnya",
  leave: "Keluar",
  again: "Cuba semula",
  right: "Betul.",
  wrong: "Belum tepat.",
  no3d: "Peranti ini tidak dapat memaparkan tempat 3D.",
};

const next = (page: Page) => page.getByRole("button", { name: MS.next, exact: true });
const options = (page: Page) => page.locator(".vh-option");
const option = (page: Page, text: string) => page.getByRole("button", { name: text, exact: true });
const header = (page: Page) => page.locator(".vh-panel .vh-panel__where");
const line = (page: Page) => page.locator(".vh-result");
const rite = (page: Page, name: string) => page.getByRole("group", { name: /^(Ibadah|Rite)$/ }).getByRole("button", { name, exact: true });
const pickOf = (number: number, wrong: number[] = []) => pickAnswer(SAI_CHECK.ms, number, wrong);
const answerTo = (page: Page, last: number) => answerQuestions(page, SAI_CHECK.ms, last);

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size, locale: "ms-MY" });

    test("Aminah finishes the sa'i walk and checks what she learned", async ({ page }) => {
      await page.goto("/#sai-13");
      await expect(title(page)).toHaveText("Sa'i selesai");
      await expect(page.locator(".walk__actions").getByRole("button", { name: MS.start })).toBeVisible();
      await expect(page.locator(".vh-panel").getByRole("button", { name: MS.startAgain })).toBeVisible();
      await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });

      await page.getByRole("button", { name: MS.start }).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#semak-sai$/);
      await expect(options(page).first(), "the focus moves into the check").toBeFocused();
      await expect(header(page)).toHaveText("Semakan sa'i · Soalan 1 daripada 7");
      await expect(rite(page, "Sa'i")).toHaveAttribute("aria-pressed", "true");
      await expectBeads(page, 0, 1);
      await expectCamera(page, 3);
      await expect(names(page)).toHaveCount(0);
      const canvas = page.locator("[data-scene] canvas");
      await expect(canvas, "a screen reader hears no place name before the pick").not.toHaveAttribute("aria-label", /Safa/);
      await expect(title(page)).toHaveText("Di mana sa'i bermula?");
      await expect(options(page)).toHaveCount(3);
      await expect(next(page)).toHaveAttribute("aria-disabled", "true");
      await expectNotices(page);

      const right = option(page, "Bukit Safa");
      await right.click();
      await expect(right).toHaveClass(/vh-option--right/);
      await expect(line(page)).toContainText(MS.right);
      await expect(option(page, "Bukit Marwah")).toHaveAttribute("aria-disabled", "true");
      await expect(names(page)).toHaveText(["Bukit Safa"], { useInnerText: true });
      await expect(canvas).toHaveAttribute("aria-label", /Safa/);
      await expect(next(page)).not.toHaveAttribute("aria-disabled", "true");

      await next(page).click();
      await expect(header(page)).toHaveText("Semakan sa'i · Soalan 2 daripada 7");
      await expect(options(page).first()).toBeFocused();
      await option(page, pickOf(2)).click();
      await next(page).click();
      await expectCamera(page, 4);
      await expect(names(page)).toHaveCount(0);

      for (let number = 3; number <= 7; number += 1) {
        await expect(title(page)).toHaveText(SAI_CHECK.ms[number - 1].ask);
        await option(page, pickOf(number, [6])).click();
        await next(page).click();
      }
      await expect(title(page)).toHaveText("6 daripada 7 betul");
      await expect(header(page)).toHaveText("Semakan sa'i · Selesai");
      await expect(page.getByText("Ulang kaji langkah ini:", { exact: true })).toBeVisible();
      await expectBeads(page, 7, null);
      await expectCamera(page, 13);

      await page.getByRole("button", { name: "Langkah 7 · Perjalanan 2" }).click();
      await expect(page).toHaveURL(/#sai-7$/);
      await expect(title(page)).toHaveText("Perjalanan 2");
    });
  });
}

test.describe("a wrong count", () => {
  test.use({ viewport: SIZES[0], locale: "ms-MY" });

  test("Aminah counts a walk wrong, then leaves the check", async ({ page }) => {
    await page.goto("/#semak-sai");
    await answerTo(page, 5);
    await expect(title(page)).toHaveText("Anda berjalan dari Marwah dan sampai di Safa buat kali pertama. Berapa perjalanan sudah selesai?");
    const wrong = option(page, "Satu");
    await wrong.click();
    await expect(wrong).toHaveClass(/vh-option--wrong/);
    await expect(wrong.locator("svg")).toBeAttached();
    await expect(option(page, "Dua")).toHaveClass(/vh-option--right/);
    await expect(line(page)).toHaveText(`${MS.wrong} Safa ke Marwah ialah satu perjalanan, dan Marwah kembali ke Safa ialah perjalanan kedua.`);
    for (const each of await options(page).all()) await expect(each).toHaveAttribute("aria-disabled", "true");

    await page.getByRole("button", { name: MS.leave }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#sai-13$/);
    await expect(title(page)).toHaveText("Sa'i selesai");
    await expect(page.getByRole("button", { name: MS.start }), "the focus moves to the walk's bar").toBeFocused();
  });
});

test.describe("a projector", () => {
  test.use({ viewport: SIZES[3], locale: "en-GB" });

  test("Ustaz Hafiz runs the sa'i check for a class", async ({ page }) => {
    const loads = { masa: 0, mataf: 0 };
    page.on("request", (request) => {
      if (request.url().endsWith("/models/masa.glb")) loads.masa += 1;
      if (request.url().endsWith("/models/mataf.glb")) loads.mataf += 1;
    });
    await page.goto("/#sai-13");
    await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
    await page.keyboard.press("PageDown");
    await expect(page).toHaveURL(/#semak-sai$/);
    await expect(title(page)).toHaveText("Where does sa'i start?");
    await expect(header(page)).toHaveText("Sa'i check · Question 1 of 7");

    await page.keyboard.press("PageDown");
    await expect(title(page)).toHaveText("Where does sa'i start?");
    await option(page, "Safa").click();
    await page.keyboard.press("PageDown");
    await expect(title(page)).toHaveText("What do you do on Safa before the first walk?");

    await option(page, "Pray two rakaat").click();
    await page.getByRole("button", { name: "BM" }).click();
    await expect(title(page)).toHaveText("Apa yang anda buat di Safa sebelum perjalanan pertama?");
    await expect(option(page, "Solat sunat dua rakaat")).toHaveClass(/vh-option--wrong/);
    await expect(scene(page)).toHaveAttribute("data-state", "shown");
    expect(loads.masa).toBe(1);

    await page.reload();
    await expect(title(page)).toHaveText("Di mana sa'i bermula?");
    await expect(page.locator('.vh-option[aria-pressed="true"]')).toHaveCount(0);

    await answerTo(page, 1);
    await rite(page, "Tawaf").click();
    await expect(page).toHaveURL(/#tawaf-1$/);
    await expect(rite(page, "Tawaf")).toHaveAttribute("aria-pressed", "true");

    await page.goto("/#semak");
    await expect(title(page)).toHaveText("Di mana anda berdiri untuk memulakan tawaf?");
    await expect(header(page)).toHaveText("Semakan · Soalan 1 daripada 7");
    await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
    expect(loads.mataf).toBeGreaterThan(0);
  });
});

test.describe("no 3D", () => {
  test.use({ viewport: SIZES[0], locale: "ms-MY" });

  test("the sa'i check still works when the device cannot draw 3D", async ({ page }) => {
    await page.addInitScript(noWebGL);
    await page.goto("/#semak-sai");
    await expect(scene(page)).toHaveAttribute("data-state", "unsupported");
    await expect(page.locator("[data-still]")).toBeVisible();
    expect(await markerAt(page)).toEqual(SAI_SPOTS[2].at!.map((value) => expect.closeTo(value, 1)));
    await expect(page.locator("[data-still] .scene__name")).toHaveCount(0);
    await expect(page.locator("[data-still]"), "a screen reader hears no place name before the pick").not.toHaveAttribute("aria-label", /Safa/);
    await expect(page.getByText(MS.no3d, { exact: true })).toBeVisible();

    await option(page, pickOf(1)).click();
    await expect(page.locator("[data-still] .scene__name")).toHaveText(["Bukit Safa"]);
    await next(page).click();
    await option(page, pickOf(2)).click();
    await next(page).click();
    expect(await markerAt(page), "the marker stands in the lane to Marwah").toEqual(SAI_SPOTS[3].at!.map((value) => expect.closeTo(value, 1)));

    for (let number = 3; number <= 7; number += 1) {
      await option(page, pickOf(number)).click();
      await next(page).click();
    }
    await expect(title(page)).toHaveText("7 daripada 7 betul");

    await page.getByRole("button", { name: MS.again }).click();
    await expect(title(page)).toHaveText(SAI_CHECK.ms[0].ask);
    await expect(page.locator('.vh-option[aria-pressed="true"]')).toHaveCount(0);
  });
});
