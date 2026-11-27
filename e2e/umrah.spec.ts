import { expect, test, type Page } from "@playwright/test";
import { CHECK, IHRAM_CHECK, SAI_CHECK } from "../src/content/check";
import { MASA } from "../src/scene/masa";
import { MAQAM } from "../src/scene/mataf";
import { SIZES, answerTo, expectCamera, expectNotices, markerAt, names, noWebGL, scene, title } from "./helpers";

const next = (page: Page) => page.getByRole("button", { name: /^(Seterusnya|Next)$/ });
const gold = (page: Page) => page.locator(".walk__actions .vh-button:not(.vh-button--quiet)");
const panel = (page: Page) => page.locator(".vh-panel");
const label = (page: Page) => page.locator(".vh-panel .vh-panel__where");
const rite = (page: Page, name: string) => page.getByRole("group", { name: /^(Ibadah|Rite)$/ }).getByRole("button", { name, exact: true });

async function tapNext(page: Page, times: number) {
  for (let tap = 0; tap < times; tap += 1) await next(page).click();
}

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size, locale: "ms-MY" });

    test("Aminah walks one whole umrah", async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto("/");
      await expect(label(page)).toHaveText("Ihram · Langkah 1 daripada 8");
      await expect(title(page)).toHaveText("Bir Ali dan bahagiannya");

      await tapNext(page, 7);
      await gold(page).click();
      await expect(page).toHaveURL(/#semak-ihram$/);
      await answerTo(page, IHRAM_CHECK.ms, 7);
      await expect(title(page)).toHaveText("7 daripada 7 betul");
      await expect(gold(page)).toHaveText("Teruskan ke tawaf");
      await expect(panel(page).getByRole("button", { name: "Cuba semula" })).toBeVisible();
      await expect(page.locator(".walk__actions").getByRole("button", { name: "Keluar" })).toBeVisible();

      await gold(page).click();
      await expect(page).toHaveURL(/#tawaf-1$/);
      await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
      await tapNext(page, 14);
      await expect(title(page)).toHaveText("Tawaf selesai");
      await next(page).click();
      await expect(label(page)).toHaveText("Tawaf · Langkah 16 daripada 16");
      await expect(title(page)).toHaveText("Solat sunat tawaf dan zamzam");
      await expectCamera(page, 16);
      await expect(names(page)).toHaveText(["Maqam Ibrahim"], { useInnerText: true });
      await expect(panel(page).getByRole("button", { name: "Teruskan ke sa'i" })).toBeVisible();
      await expect(panel(page).getByRole("button", { name: "Mula semula" })).toBeVisible();

      await gold(page).click();
      await expect(page).toHaveURL(/#semak$/);
      await answerTo(page, CHECK.ms, 7);
      await expect(gold(page)).toHaveText("Teruskan ke sa'i");
      await gold(page).click();
      await expect(page).toHaveURL(/#sai-1$/);

      await tapNext(page, 12);
      await expect(title(page)).toHaveText("Sa'i selesai");
      await gold(page).click();
      await answerTo(page, SAI_CHECK.ms, 7);
      await expect(gold(page)).toHaveText("Teruskan ke tahallul");
      await gold(page).click();
      await expect(page).toHaveURL(/#tahallul-1$/);
      await expect(label(page)).toHaveText("Tahallul · Langkah 1 daripada 2");
      await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
      await expectCamera(page, 1);
      await expect(names(page)).toHaveText(["Bukit Marwah"], { useInnerText: true });

      await next(page).click();
      await expect(title(page)).toHaveText("Umrah selesai");
      await expectCamera(page, 2);
      await expect(gold(page)).toHaveText("Mula semula umrah");
      await gold(page).click();
      await expect(page).toHaveURL(/#ihram-1$/);
      await expect(title(page)).toHaveText("Bir Ali dan bahagiannya");
    });

    test("Aminah learns tahallul past Marwah", async ({ page }) => {
      await page.goto("/#tahallul-1");
      await expect(title(page)).toHaveText("Bercukur atau bergunting");
      await expect(page.getByText(/lelaki mencukur seluruh kepala/)).toBeVisible();
      await expect(page.getByText(/Wanita menggunting rambut/)).toBeVisible();
      await page.getByText("Mazhab lain berbeza di sini", { exact: true }).click();
      await expect(page.getByText(/^Syafi'i: sekurang-kurangnya tiga helai rambut\. Hanafi: suku kepala\. Maliki dan Hanbali/)).toBeVisible();
      await expect(page.locator(".vh-panel .vh-bead")).toHaveCount(0);
      await expectNotices(page);
      await expect(page.getByRole("group", { name: "Ibadah" }).getByRole("button")).toHaveText(["Ihram", "Tawaf", "Sa'i", "Tahallul"]);
      await expect(rite(page, "Tahallul")).toHaveAttribute("aria-pressed", "true");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "the page does not scroll sideways").toBe(true);

      await next(page).click();
      await expect(title(page)).toHaveText("Umrah selesai");
      await expect(page.getByText(/larangan ihram tamat/)).toBeVisible();
      await page.keyboard.press("PageDown");
      await expect(page).toHaveURL(/#ihram-1$/);
    });
  });
}

test.describe("a projector", () => {
  test.use({ viewport: SIZES[3], locale: "en-GB" });

  test("Ustaz Hafiz takes a class from one rite to the next with a clicker", async ({ page }) => {
    await page.goto("/#semak");
    await page.getByRole("button", { name: "BM" }).click();
    await answerTo(page, CHECK.ms, 7);
    await expect(title(page)).toHaveText("7 daripada 7 betul");
    await page.getByRole("button", { name: "EN" }).click();
    await expect(gold(page)).toHaveText("Go on to sa'i");
    await page.keyboard.press("PageDown");
    await expect(page).toHaveURL(/#sai-1$/);
    await expect(title(page)).toHaveText("The mas'a and its parts");

    await page.goto("/#tawaf-15");
    await expect(title(page)).toHaveText("Tawaf is complete");
    await page.keyboard.press("PageDown");
    await expect(page).toHaveURL(/#tawaf-16$/);
    await expect(title(page)).toHaveText("Solat sunat tawaf and zamzam");
    await page.reload();
    await expect(title(page)).toHaveText("Solat sunat tawaf and zamzam");
    await page.keyboard.press("PageDown");
    await expect(page).toHaveURL(/#semak$/);
    await expect(title(page)).toHaveText(CHECK.en[0].ask);
  });
});

test.describe("no 3D", () => {
  test.use({ viewport: SIZES[0], locale: "ms-MY" });

  test("Aminah sees the new steps on the top-view map", async ({ page }) => {
    await page.addInitScript(noWebGL);
    await page.goto("/#tawaf-16");
    await expect(scene(page)).toHaveAttribute("data-state", "unsupported");
    const [x, y] = await markerAt(page);
    expect(Math.hypot(x, y), "the marker is further from the Kaabah than Maqam Ibrahim").toBeGreaterThan(Math.hypot(MAQAM[0], MAQAM[1]));
    expect(Math.hypot(x - MAQAM[0], y - MAQAM[1]), "the marker is just behind Maqam Ibrahim").toBeLessThan(6);
    await expect(page.locator("[data-still] .scene__name")).toHaveText(["Maqam Ibrahim"]);

    await rite(page, "Tahallul").click();
    await expect(page).toHaveURL(/#tahallul-1$/);
    await expect(page.locator("[data-still]")).toBeVisible();
    const [pastX] = await markerAt(page);
    expect(pastX, "the marker stands past the Marwah rock").toBeGreaterThan(MASA.marwah.at[0] + MASA.marwah.radius);
    await expect(page.getByText("Peranti ini tidak dapat memaparkan tempat 3D.", { exact: true })).toBeVisible();
  });
});

test.describe("addresses", () => {
  test.use({ viewport: SIZES[0], locale: "ms-MY" });

  test("old and wrong addresses still open a step", async ({ page }) => {
    await page.goto("/#tahallul-5");
    await expect(label(page)).toHaveText("Tahallul · Langkah 1 daripada 2");
    await page.goto("/#tawaf-17");
    await expect(label(page)).toHaveText("Tawaf · Langkah 1 daripada 16");
    await page.goto("/#semak");
    await expect(title(page)).toHaveText(CHECK.ms[0].ask);
    await page.goto("/#umrah");
    await expect(label(page)).toHaveText("Ihram · Langkah 1 daripada 8");
  });
});
