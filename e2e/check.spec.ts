import { expect, test, type Page } from "@playwright/test";
import { CHECK } from "../src/content/check";
import { SPOTS } from "../src/scene/mataf";
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

const pickOf = (number: number, wrong: number[] = []) => pickAnswer(CHECK.ms, number, wrong);
const answerTo = (page: Page, last: number) => answerQuestions(page, CHECK.ms, last);

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size, locale: "ms-MY" });

    test("Aminah finishes the walk and checks what she learned", async ({ page }) => {
      await page.goto("/#tawaf-16");
      await expect(title(page)).toHaveText("Solat sunat tawaf dan zamzam");
      await expect(page.locator(".walk__actions").getByRole("button", { name: MS.start })).toBeVisible();
      await expect(page.locator(".vh-panel").getByRole("button", { name: MS.startAgain })).toBeVisible();
      await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });

      await page.getByRole("button", { name: MS.start }).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#semak$/);
      await expect(options(page).first(), "the focus moves into the check").toBeFocused();
      await expect(header(page)).toHaveText("Semakan · Soalan 1 daripada 7");
      await expectBeads(page, 0, 1);
      await expectCamera(page, 3);
      await expect(names(page)).toHaveCount(0);
      const canvas = page.locator("[data-scene] canvas");
      await expect(canvas, "a screen reader hears no place name before the pick").not.toHaveAttribute("aria-label", /Hajar Aswad/);
      await expect(title(page)).toHaveText("Di mana anda berdiri untuk memulakan tawaf?");
      await expect(options(page)).toHaveCount(3);
      await expect(next(page)).toHaveAttribute("aria-disabled", "true");
      await expectNotices(page);

      const right = option(page, "Sejajar dengan penjuru Hajar Aswad");
      await right.click();
      await expect(right).toHaveClass(/vh-option--right/);
      await expect(line(page)).toContainText(MS.right);
      await expect(option(page, "Di hadapan pintu Kaabah")).toHaveAttribute("aria-disabled", "true");
      await expect(names(page)).toHaveText(["Hajar Aswad", "Lampu hijau"], { useInnerText: true });
      await expect(canvas).toHaveAttribute("aria-label", /Hajar Aswad/);
      await expect(next(page)).not.toHaveAttribute("aria-disabled", "true");

      await next(page).click();
      await expect(header(page)).toHaveText("Semakan · Soalan 2 daripada 7");
      await expect(options(page).first()).toBeFocused();
      await option(page, pickOf(2)).click();
      await next(page).click();
      await expectCamera(page, 4);
      await expect(names(page)).toHaveCount(0);

      for (let number = 3; number <= 7; number += 1) {
        await expect(title(page)).toHaveText(CHECK.ms[number - 1].ask);
        await option(page, pickOf(number, [5])).click();
        await next(page).click();
      }
      await expect(title(page)).toHaveText("6 daripada 7 betul");
      await expect(page.getByText("Ulang kaji langkah ini:", { exact: true })).toBeVisible();
      await expectBeads(page, 7, null);
      await expect(page.locator(".walk__actions").getByRole("button", { name: "Teruskan ke sa'i" })).toBeVisible();
      await expect(page.locator(".vh-panel").getByRole("button", { name: MS.again })).toBeVisible();

      await page.getByRole("button", { name: "Langkah 6 · Rukun Yamani" }).click();
      await expect(page).toHaveURL(/#tawaf-6$/);
      await expect(title(page)).toHaveText("Rukun Yamani");
    });
  });
}

test.describe("a wrong answer", () => {
  test.use({ viewport: SIZES[0], locale: "ms-MY" });

  test("Aminah picks a wrong answer, then leaves the check", async ({ page }) => {
    await page.goto("/#semak");
    await answerTo(page, 2);
    await expect(title(page)).toHaveText("Semasa anda berjalan, di sebelah mana Kaabah?");
    const wrong = option(page, "Di sebelah kanan");
    await wrong.click();
    await expect(wrong).toHaveClass(/vh-option--wrong/);
    await expect(wrong.locator("svg")).toBeAttached();
    await expect(option(page, "Di sebelah kiri")).toHaveClass(/vh-option--right/);
    await expect(line(page)).toHaveText(`${MS.wrong} Kaabah sentiasa di sebelah kiri anda sepanjang tawaf.`);
    for (const each of await options(page).all()) await expect(each).toHaveAttribute("aria-disabled", "true");

    await page.getByRole("button", { name: MS.leave }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#tawaf-16$/);
    await expect(title(page)).toHaveText("Solat sunat tawaf dan zamzam");
    await expect(page.getByRole("button", { name: MS.start }), "the focus moves to the walk's bar").toBeFocused();
  });

  test("Aminah tries the check again from the result by keyboard", async ({ page }) => {
    await page.goto("/#semak");
    await answerTo(page, 7);
    await expect(title(page)).toHaveText("7 daripada 7 betul");
    await page.locator(".vh-panel").getByRole("button", { name: MS.again }).focus();
    await page.keyboard.press("Enter");
    await expect(header(page)).toHaveText("Semakan · Soalan 1 daripada 7");
    await expect(options(page).first(), "the focus moves to the first answer").toBeFocused();
  });
});

test.describe("a projector", () => {
  test.use({ viewport: SIZES[3], locale: "en-GB" });

  test("Ustaz Hafiz runs the check for a class", async ({ page }) => {
    let modelLoads = 0;
    page.on("request", (request) => {
      if (request.url().endsWith("/models/mataf.glb")) modelLoads += 1;
    });
    await page.goto("/#tawaf-16");
    await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
    await page.keyboard.press("PageDown");
    await expect(page).toHaveURL(/#semak$/);
    await expect(title(page)).toHaveText("Where do you stand to start tawaf?");

    await page.keyboard.press("PageDown");
    await expect(title(page)).toHaveText("Where do you stand to start tawaf?");
    await option(page, "In line with the Hajar Aswad corner").click();
    await page.keyboard.press("PageDown");
    await expect(title(page)).toHaveText("What do you do here before the first circuit?");

    await option(page, "Pray two rakaat").click();
    await page.getByRole("button", { name: "BM" }).click();
    await expect(title(page)).toHaveText("Apa yang anda buat di sini sebelum pusingan pertama?");
    await expect(option(page, "Solat sunat dua rakaat")).toHaveClass(/vh-option--wrong/);
    await expect(line(page)).toContainText(MS.wrong);
    await expect(scene(page)).toHaveAttribute("data-state", "shown");
    expect(modelLoads).toBe(1);

    await page.reload();
    await expect(title(page)).toHaveText("Di mana anda berdiri untuk memulakan tawaf?");
    await expect(page.locator('.vh-option[aria-pressed="true"]')).toHaveCount(0);

    await page.goBack();
    await expect(page).toHaveURL(/#tawaf-16$/);
    await expect(title(page)).toHaveText("Solat sunat tawaf dan zamzam");
  });
});

test.describe("no 3D", () => {
  test.use({ viewport: SIZES[0], locale: "ms-MY" });

  test("the check still works when the device cannot draw 3D", async ({ page }) => {
    await page.addInitScript(noWebGL);
    await page.goto("/#semak");
    await expect(scene(page)).toHaveAttribute("data-state", "unsupported");
    await expect(page.locator("[data-still]")).toBeVisible();
    expect(await markerAt(page)).toEqual(SPOTS[2].at!.map((value) => expect.closeTo(value, 1)));
    await expect(page.locator("[data-still] .scene__name")).toHaveCount(0);
    await expect(page.locator("[data-still]"), "a screen reader hears no place name before the pick").not.toHaveAttribute("aria-label", /Hajar Aswad/);
    const message = page.getByText(MS.no3d, { exact: true });
    await expect(message).toBeVisible();
    expect((await message.boundingBox())!.y, "the message sits under the step panel").toBeGreaterThan((await page.locator(".vh-panel").boundingBox())!.y);

    await option(page, pickOf(1)).click();
    await expect(page.locator("[data-still] .scene__name")).toHaveText(["Hajar Aswad", "Lampu hijau"]);
    await next(page).click();
    await option(page, pickOf(2)).click();
    await next(page).click();
    expect(await markerAt(page)).toEqual(SPOTS[3].at!.map((value) => expect.closeTo(value, 1)));

    for (let number = 3; number <= 7; number += 1) {
      await option(page, pickOf(number)).click();
      await next(page).click();
    }
    await expect(title(page)).toHaveText("7 daripada 7 betul");
    await expect(page.getByText("Anda tahu tempat dan amalan setiap langkah.", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: MS.again }).click();
    await expect(title(page)).toHaveText(CHECK.ms[0].ask);
    await expect(page.locator('.vh-option[aria-pressed="true"]')).toHaveCount(0);
  });
});

for (const size of [SIZES[0], SIZES[1]]) {
  test.describe(`the line why at ${size.width}x${size.height}`, () => {
    test.use({ viewport: size, locale: "ms-MY" });

    test("is not under the bar after a pick", async ({ page }) => {
      await page.goto("/#semak");
      await answerTo(page, 1);
      await expect(options(page).first()).toBeFocused();
      // The smooth scroll of question 1 and the focus of question 2 end before the test sets its own scroll.
      const scrolled = () => page.evaluate(() => `${document.scrollingElement!.scrollTop} ${document.querySelector(".app__side")!.scrollTop}`);
      let before = "";
      await expect.poll(async () => before === (before = await scrolled()), { intervals: [250] }).toBe(true);
      // Scroll so that the last answer sits just above the bar, and the line why starts under it.
      // The side column scrolls in landscape, and the page in portrait.
      const last = option(page, CHECK.ms[1].answers[2]);
      await last.evaluate((button) => {
        const side = button.closest(".app__side")!;
        const scroller = getComputedStyle(side).overflowY === "auto" ? side : document.scrollingElement!;
        const bar = side.querySelector(".walk__actions")!.getBoundingClientRect();
        scroller.scrollTop += button.getBoundingClientRect().bottom - bar.top + 16;
      });
      const bar = (await page.locator(".walk__actions").boundingBox())!;
      expect((await line(page).boundingBox())!.y, "the line starts under the bar").toBeGreaterThan(bar.y);
      await last.click();
      await expect
        .poll(async () => (await line(page).boundingBox())!.y + (await line(page).boundingBox())!.height, "the line ends above the bar")
        .toBeLessThanOrEqual((await page.locator(".walk__actions").boundingBox())!.y);
    });
  });
}

test.describe("reduced motion", () => {
  test.use({ viewport: SIZES[0], locale: "ms-MY", reducedMotion: "reduce" });

  test("the camera cuts between two questions", async ({ page }) => {
    const lines: string[] = [];
    page.on("console", (message) => lines.push(message.text()));
    await page.goto("/#semak");
    await expectCamera(page, 3);
    await answerTo(page, 2);
    await expectCamera(page, 4);
    await expect.poll(() => lines.find((text) => text.startsWith("[isfar] camera at step 4"))).toMatch(/in 0 ms$/);
  });
});
