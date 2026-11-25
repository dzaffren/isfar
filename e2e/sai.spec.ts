import { expect, test, type Page } from "@playwright/test";
import { GREEN, LANES, WALK, laneLine } from "../src/scene/masa";
import {
  MASA_MODEL,
  SIZES,
  expectApart,
  expectBeads,
  expectCamera,
  expectNotices,
  kaabahIsDrawn,
  lightAt,
  markerAt,
  modelParts,
  names,
  noWebGL,
  scene,
  title,
} from "./helpers";

const MS = {
  no3d: "Peranti ini tidak dapat memaparkan tempat 3D.",
  failed: "Tempat 3D tidak dapat dimuatkan.",
  retry: "Cuba lagi",
  loading: "Memuatkan mas'a",
  next: "Seterusnya",
  back: "Kembali",
  startAgain: "Mula semula",
  checkStart: "Mula semakan",
  note: "Mazhab lain berbeza di sini",
};

const next = (page: Page) => page.getByRole("button", { name: MS.next, exact: true });
const rite = (page: Page, name: string) => page.getByRole("group", { name: /^(Ibadah|Rite)$/ }).getByRole("button", { name, exact: true });

async function tapNext(page: Page, times: number) {
  for (let tap = 0; tap < times; tap += 1) await next(page).click();
}

// The wide view of step 1 looks along the hall from behind Safa, so the rock of Safa fills the bottom of the scene.
async function masaIsDrawn(page: Page) {
  expect(await lightAt(page, 0.5, 0.87), "the rock of Safa is dark at the bottom of the wide view").toBeLessThan(170);
}

// The path line on the map, back in the plan's metres. The map draws y down.
async function mapPath(page: Page): Promise<[number, number][]> {
  const values = (await page.locator("[data-path]").getAttribute("points"))!.split(" ").map(Number);
  return values.flatMap((value, index): [number, number][] => (index % 2 === 0 ? [[value, 0 - values[index + 1]]] : []));
}

// The five arrows on the map sit in the lane of the walk, and point to its hill.
async function expectArrows(page: Page, towards: "marwah" | "safa") {
  const lane = towards === "marwah" ? LANES.toMarwah : LANES.toSafa;
  const arrows = await page.locator(".map__arrow").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("transform")));
  expect(arrows).toHaveLength(5);
  for (const arrow of arrows) expect(arrow).toMatch(new RegExp(` ${-lane}\\) rotate\\(${towards === "marwah" ? 0 : 180}\\)$`));
}

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size });

    test.describe("Malay device", () => {
      test.use({ locale: "ms-MY" });

      test("Aminah walks sa'i from the first step to the last", async ({ page }) => {
        await page.goto("/#tawaf-1");
        await expect(title(page)).toHaveText("Kaabah dan bahagiannya");
        await rite(page, "Sa'i").click();
        await expect(page).toHaveURL(/#sai-1$/);
        await expect(page.getByText("Sa'i · Langkah 1 daripada 13", { exact: true })).toBeVisible();
        await expect(title(page)).toHaveText("Mas'a dan bahagiannya");
        await expect(rite(page, "Sa'i")).toHaveAttribute("aria-pressed", "true");
        await expectNotices(page);
        await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await expectCamera(page, 1);
        await masaIsDrawn(page);
        expect(await modelParts(page, "masa")).toEqual(expect.arrayContaining(["floor", "wall", "arch", "rock", "lamp", "barrier"]));
        await expect(names(page)).toHaveText(["Bukit Safa", "Bukit Marwah", "Lampu hijau"], { useInnerText: true });
        const frame = (await page.locator(".scene__frame").boundingBox())!;
        const boxes = await Promise.all((await names(page).all()).map(async (name) => (await name.boundingBox())!));
        for (const box of boxes) {
          expect(box.x).toBeGreaterThanOrEqual(frame.x);
          expect(box.x + box.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
        }
        expectApart(boxes);
        await expectBeads(page, 0, null);
        await expect(page.getByRole("button", { name: MS.back })).toHaveCount(0);

        await tapNext(page, 2);
        await expect(page).toHaveURL(/#sai-3$/);
        await expect(title(page)).toHaveText("Bukit Safa");
        await expectCamera(page, 3);

        await tapNext(page, 1);
        await expect(title(page)).toHaveText("Ke arah Marwah");
        await expectBeads(page, 0, 1);
        await expectCamera(page, 4);

        await tapNext(page, 2);
        await expect(title(page)).toHaveText("Bukit Marwah");
        await expectCamera(page, 6);

        await tapNext(page, 1);
        await expect(title(page)).toHaveText("Perjalanan 2");
        await expectBeads(page, 1, 2);

        await tapNext(page, 6);
        await expect(title(page)).toHaveText("Sa'i selesai");
        await expectBeads(page, 7, null);
        await expect(next(page)).toHaveCount(0);
        await expect(page.getByRole("button", { name: MS.checkStart })).toHaveCount(0);
        await expectCamera(page, 13);

        await page.locator(".walk__actions").getByRole("button", { name: MS.startAgain }).click();
        await expect(page).toHaveURL(/#sai-1$/);
        await expect(title(page)).toHaveText("Mas'a dan bahagiannya");
        await expectCamera(page, 1);
      });

      test("a sa'i step shows a recitation and a note on the other schools", async ({ page }) => {
        await page.goto("/#sai-3");
        await expect(title(page)).toHaveText("Bukit Safa");
        const arabic = page.locator('.vh-arabic [lang="ar"]');
        await expect(arabic).toHaveText("إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ");
        await expect(arabic).toHaveAttribute("dir", "rtl");
        const sound = page.getByText("Innas-safa wal-marwata min sha'a'irillah", { exact: true });
        await expect(sound).toBeVisible();
        await expect(page.locator(".vh-arabic__meaning")).toHaveText(/^Sesungguhnya Safa dan Marwah/);

        await page.getByRole("button", { name: "EN" }).click();
        await expect(page.locator(".vh-arabic__meaning")).toHaveText(/^Safa and Marwah are among the signs of Allah/);
        await expect(arabic).toHaveText(/^إِنَّ الصَّفَا/);
        await expect(sound).toBeVisible();

        await page.getByRole("button", { name: "BM" }).click();
        await page.goto("/#sai-5");
        await expect(title(page)).toHaveText("Antara lampu hijau");
        await expect(page.getByText("Rabbighfir warham, innaka antal a'azzul akram", { exact: true })).toBeVisible();
        await expect(page.getByText(/lelaki berjalan cepat dengan langkah pendek\. Wanita berjalan seperti biasa\./)).toBeVisible();

        await page.goto("/#sai-2");
        await expect(title(page)).toHaveText("Sebelum bermula");
        const ruling = page.getByText(
          "Syafi'i, Maliki dan Hanbali: sa'i ialah rukun umrah, dan umrah tidak sah tanpanya. Hanafi: sa'i wajib tetapi bukan rukun. Jika ditinggalkan, umrah sah dan dam dikenakan.",
          { exact: true },
        );
        await expect(page.getByText(MS.note, { exact: true })).toBeVisible();
        await expect(ruling).toBeHidden();
        await page.getByText(MS.note, { exact: true }).click();
        await expect(ruling).toBeVisible();

        await page.goto("/#sai-4");
        await expect(title(page)).toHaveText("Ke arah Marwah");
        await expect(page.locator(".vh-note")).toHaveCount(0);
      });

      test("the sa'i walk still works when the device cannot draw 3D", async ({ page }) => {
        await page.addInitScript(noWebGL);
        let modelAsked = false;
        page.on("request", (request) => {
          if (request.url().endsWith("/models/masa.glb")) modelAsked = true;
        });
        await page.goto("/#sai-3");
        await expect(title(page)).toHaveText("Bukit Safa");
        await expect(page.getByText(/^Naik sedikit ke Bukit Safa/)).toBeVisible();
        await expectBeads(page, 0, null);
        await expectNotices(page);
        await expect(scene(page)).toHaveAttribute("data-state", "unsupported");
        await expect(page.locator("[data-still]")).toBeVisible();
        const [x] = await markerAt(page);
        expect(x, "the marker is on the slope of Safa").toBeLessThan(WALK.from);
        const message = page.getByText(MS.no3d, { exact: true });
        await expect(message).toBeVisible();
        expect((await message.boundingBox())!.y, "the message sits under the step panel").toBeGreaterThan((await page.locator(".vh-panel").boundingBox())!.y);
        await expect(page.getByRole("button", { name: MS.retry })).toHaveCount(0);

        await tapNext(page, 2);
        await expect(title(page)).toHaveText("Antara lampu hijau");
        const [atX] = await markerAt(page);
        expect(atX, "the marker is between the two green lights").toBeGreaterThan(GREEN[0]);
        expect(atX).toBeLessThan(GREEN[1]);
        expect(modelAsked).toBe(false);
      });

      test("the top-view map shows the two lanes when the 3D place cannot show", async ({ page }) => {
        await page.addInitScript(noWebGL);
        await page.goto("/#sai-4");
        await expect(title(page)).toHaveText("Ke arah Marwah");
        await expect(scene(page)).toHaveAttribute("data-state", "unsupported");
        await expect(page.locator("[data-still] .map__barrier")).toHaveCount(1);
        const [, y] = await markerAt(page);
        expect(y, "the marker is in the lane to Marwah").toBe(LANES.toMarwah);
        expect(await mapPath(page)).toEqual(laneLine("marwah"));
        await expectArrows(page, "marwah");

        await tapNext(page, 3);
        await expect(title(page)).toHaveText("Perjalanan 2");
        expect(await mapPath(page)).toEqual(laneLine("safa"));
        await expectArrows(page, "safa");
      });

      test("the download of the 3D mas'a fails on step 5, and Cuba lagi brings it back", async ({ page }) => {
        await page.route(MASA_MODEL, (route) => route.abort("internetdisconnected"));
        await page.goto("/#sai-5");
        await expect(title(page)).toHaveText("Antara lampu hijau");
        await expect(scene(page)).toHaveAttribute("data-state", "failed", { timeout: 15_000 });
        await expect(page.locator("[data-still] [data-marker]")).toBeVisible();
        await expect(page.getByText(MS.failed, { exact: true })).toBeVisible();

        await page.unroute(MASA_MODEL);
        await page.route(MASA_MODEL, async (route) => {
          await new Promise((done) => setTimeout(done, 1500));
          await route.continue();
        });
        await page.getByRole("button", { name: MS.retry }).click();
        await expect(page.getByText(MS.loading, { exact: true })).toBeVisible();
        await expect(page).toHaveURL(/#sai-5$/);
        await expect(title(page)).toHaveText("Antara lampu hijau");
        await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await expectCamera(page, 5);
      });
    });

    test.describe("English device", () => {
      test.use({ locale: "en-GB" });

      test("Ustaz Hafiz opens a sa'i step by its link, and moves between the two rites", async ({ page }) => {
        let masaLoads = 0;
        page.on("request", (request) => {
          if (request.url().endsWith("/models/masa.glb")) masaLoads += 1;
        });
        await page.goto("/#sai-5");
        await expect(title(page)).toHaveText("Between the green lights");
        await expectBeads(page, 0, 1);
        await expect(rite(page, "Sa'i")).toHaveAttribute("aria-pressed", "true");
        await expect(rite(page, "Tawaf")).toHaveAttribute("aria-pressed", "false");
        await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await expectCamera(page, 5);
        const canvas = await page.locator("[data-scene] canvas").elementHandle();

        await page.keyboard.press("ArrowRight");
        await expect(title(page)).toHaveText("Marwah");
        await page.keyboard.press("PageUp");
        await expect(title(page)).toHaveText("Between the green lights");

        await page.getByRole("button", { name: "BM" }).click();
        await expect(title(page)).toHaveText("Antara lampu hijau");
        await expect(scene(page)).toHaveAttribute("data-state", "shown");
        expect(await canvas!.evaluate((node) => node.isConnected)).toBe(true);
        expect(masaLoads).toBe(1);

        await page.reload();
        await expect(title(page)).toHaveText("Antara lampu hijau");
        await expect(page).toHaveURL(/#sai-5$/);

        await rite(page, "Tawaf").click();
        await expect(page).toHaveURL(/#tawaf-1$/);
        await expect(title(page)).toHaveText("Kaabah dan bahagiannya");
        await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await expectCamera(page, 1);
        await kaabahIsDrawn(page);

        await page.goBack();
        await expect(page).toHaveURL(/#sai-5$/);
        await expect(title(page)).toHaveText("Antara lampu hijau");
        await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await expectCamera(page, 5);

        await page.goto("/#sai-13");
        await expect(title(page)).toHaveText("Sa'i selesai");
        await expectCamera(page, 13);
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("PageDown");
        await expect(page).toHaveURL(/#sai-13$/);
        await expect(title(page)).toHaveText("Sa'i selesai");

        await page.goto("/#sai-0");
        await expect(title(page)).toHaveText("Mas'a dan bahagiannya");
        await page.goto("/#sai-99");
        await expect(title(page)).toHaveText("Mas'a dan bahagiannya");
        await page.goto("/#abc");
        await expect(title(page)).toHaveText("Kaabah dan bahagiannya");

        await page.goto("/#semak");
        await expect(rite(page, "Tawaf")).toHaveAttribute("aria-pressed", "true");
      });
    });
  });
}

test.describe("reduced motion in the mas'a", () => {
  test.use({ viewport: { width: 360, height: 800 }, locale: "ms-MY", reducedMotion: "reduce" });

  test("the camera cuts and does not fly", async ({ page }) => {
    const lines: string[] = [];
    page.on("console", (message) => lines.push(message.text()));
    await page.goto("/#sai-1");
    await expectCamera(page, 1);
    await next(page).click();
    await expectCamera(page, 2);
    await expect.poll(() => lines.find((line) => line.startsWith("[isfar] camera at step 2"))).toMatch(/in 0 ms$/);
  });
});
