import { expect, test, type Page } from "@playwright/test";
import { HIJR, RUKUN_YAMANI } from "../src/scene/mataf";

const SIZES = [
  { width: 360, height: 800 },
  { width: 960, height: 540 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
];

const MS = {
  review: "Kandungan ini belum disemak oleh orang yang bertauliah.",
  layout: "Susun atur pada hari sebenar mungkin berbeza. Ikut mutawwif anda dan papan tanda.",
  no3d: "Peranti ini tidak dapat memaparkan tempat 3D.",
  failed: "Tempat 3D tidak dapat dimuatkan.",
  retry: "Cuba lagi",
  loading: "Memuatkan Kaabah",
  next: "Seterusnya",
  back: "Kembali",
  startAgain: "Mula semula",
  note: "Mazhab lain berbeza di sini",
};

const MODEL = "**/models/mataf.glb";

const title = (page: Page) => page.getByRole("heading", { level: 1 });
const scene = (page: Page) => page.locator("[data-scene]");
const names = (page: Page) => page.locator("[data-scene] .scene__name").filter({ visible: true });
const next = (page: Page) => page.getByRole("button", { name: MS.next, exact: true });

async function expectNotices(page: Page) {
  await expect(page.getByText(MS.review, { exact: true })).toBeAttached();
  await expect(page.getByText(MS.layout, { exact: true })).toBeAttached();
}

async function expectBeads(page: Page, done: number, now: number | null) {
  const beads = page.locator(".vh-panel .vh-bead");
  await expect(beads).toHaveCount(7);
  await expect(page.locator(".vh-panel .vh-bead--done")).toHaveCount(done);
  if (now === null) await expect(page.locator(".vh-panel .vh-bead--now")).toHaveCount(0);
  else await expect(beads.nth(now - 1)).toHaveClass(/vh-bead--now/);
}

// The camera is at the view of a step when the place says so, and no move is under way.
async function expectCamera(page: Page, step: number) {
  await expect(scene(page)).toHaveAttribute("data-camera", String(step), { timeout: 15_000 });
  await expect(scene(page)).not.toHaveAttribute("data-moving", "true");
}

async function tapNext(page: Page, times: number) {
  for (let tap = 0; tap < times; tap += 1) await next(page).click();
}

// The page decodes a screenshot of the canvas, and reads the light of one pixel.
async function lightAt(page: Page, x: number, y: number) {
  const canvas = page.locator("[data-scene] canvas");
  await expect(canvas).toBeVisible();
  const png = (await canvas.screenshot()).toString("base64");
  return page.evaluate(
    async ({ data, x, y }) => {
      const image = await createImageBitmap(await (await fetch("data:image/png;base64," + data)).blob());
      const sheet = new OffscreenCanvas(image.width, image.height).getContext("2d")!;
      sheet.drawImage(image, 0, 0);
      const [r, g, b] = sheet.getImageData(Math.round(image.width * x), Math.round(image.height * y), 1, 1).data;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },
    { data: png, x, y },
  );
}

async function kaabahIsDrawn(page: Page) {
  expect(await lightAt(page, 0.5, 0.45), "the kiswah is dark at the centre of the wide view").toBeLessThan(80);
}

// The names of the mesh nodes in the model file, read from the JSON chunk of the .glb.
async function modelParts(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const bytes = await (await fetch("/models/mataf.glb")).arrayBuffer();
    const view = new DataView(bytes);
    const length = view.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes, 20, length)));
    return json.nodes.map((node: { name: string }) => node.name);
  });
}

function expectApart(boxes: { x: number; y: number; width: number; height: number }[]) {
  boxes.forEach((one, index) => {
    for (const two of boxes.slice(index + 1)) {
      const apart = one.x + one.width <= two.x || two.x + two.width <= one.x || one.y + one.height <= two.y || two.y + two.height <= one.y;
      expect(apart, "two names overlap").toBe(true);
    }
  });
}

// A marker on the map, back in the plan's metres. The map draws y down.
async function markerAt(page: Page): Promise<[number, number]> {
  const marker = page.locator("[data-marker]");
  return [Number(await marker.getAttribute("cx")), -Number(await marker.getAttribute("cy"))];
}

const noWebGL = () => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    if (type.includes("webgl")) return null;
    return original.call(this, type, ...(rest as []));
  } as typeof original;
};

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size });

    test.describe("Malay device", () => {
      test.use({ locale: "ms-MY" });

      test("Aminah walks tawaf from the first step to the last", async ({ page }) => {
        await page.goto("/");
        await expect(title(page)).toHaveText("Kaabah dan bahagiannya");
        await expectNotices(page);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
        await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await expectCamera(page, 1);
        await kaabahIsDrawn(page);
        expect(await modelParts(page)).toEqual(expect.arrayContaining(["kiswah", "stone", "hijr", "maqam", "arcade", "arch", "guide", "lamp"]));
        await expect(names(page)).toHaveText(["Hajar Aswad", "Pintu Kaabah", "Hijr Ismail", "Rukun Yamani", "Maqam Ibrahim"], { useInnerText: true });
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
        await expect(page).toHaveURL(/#tawaf-3$/);
        await expect(title(page)).toHaveText("Tempat mula");
        await expectCamera(page, 3);
        await expect(names(page)).toHaveText(["Hajar Aswad", "Lampu hijau"], { useInnerText: true });

        await tapNext(page, 1);
        await expect(title(page)).toHaveText("Kaabah di sebelah kiri");
        await expectBeads(page, 0, 1);
        await expectCamera(page, 4);

        await tapNext(page, 5);
        await expect(title(page)).toHaveText("Pusingan 2");
        await expectBeads(page, 1, 2);

        await tapNext(page, 6);
        await expect(title(page)).toHaveText("Tawaf selesai");
        await expectBeads(page, 7, null);
        await expect(next(page)).toHaveCount(0);
        await expectCamera(page, 15);

        await page.getByRole("button", { name: MS.startAgain }).click();
        await expect(title(page)).toHaveText("Kaabah dan bahagiannya");
        await expect(page).toHaveURL(/#tawaf-1$/);
        await expectCamera(page, 1);
      });

      test("a step shows a recitation and a note on the other schools", async ({ page }) => {
        await page.goto("/#tawaf-7");
        await expect(title(page)).toHaveText("Antara dua penjuru");
        const arabic = page.locator('.vh-arabic [lang="ar"]');
        await expect(arabic).toHaveText("رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ");
        await expect(arabic).toHaveAttribute("dir", "rtl");
        const sound = page.getByText("Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina 'adhaban-nar", { exact: true });
        await expect(sound).toBeVisible();
        await expect(page.locator(".vh-arabic__meaning")).toHaveText(/^Wahai Tuhan kami/);

        await page.getByRole("button", { name: "EN" }).click();
        await expect(page.locator(".vh-arabic__meaning")).toHaveText(/^Our Lord, give us good/);
        await expect(arabic).toHaveText(/^رَبَّنَا/);
        await expect(sound).toBeVisible();

        await page.getByRole("button", { name: "BM" }).click();
        await page.goto("/#tawaf-2");
        await expect(title(page)).toHaveText("Sebelum bermula");
        const ruling = page.getByText("Syafi'i, Maliki dan Hanbali: wuduk ialah syarat sah tawaf. Hanafi: wuduk wajib tetapi bukan syarat. Tawaf tanpa wuduk sah, dan dam dikenakan.", { exact: true });
        await expect(page.getByText(MS.note, { exact: true })).toBeVisible();
        await expect(ruling).toBeHidden();
        await page.getByText(MS.note, { exact: true }).click();
        await expect(ruling).toBeVisible();

        await page.goto("/#tawaf-4");
        await expect(title(page)).toHaveText("Kaabah di sebelah kiri");
        await expect(page.locator(".vh-note")).toHaveCount(0);
      });

      test("the walk still works when the device cannot draw 3D", async ({ page }) => {
        await page.addInitScript(noWebGL);
        let modelAsked = false;
        page.on("request", (request) => {
          if (request.url().endsWith("/models/mataf.glb")) modelAsked = true;
        });
        await page.goto("/#tawaf-5");
        await expect(title(page)).toHaveText("Hijr Ismail");
        await expect(page.getByText(/^Jalan di luar tembok rendah Hijr Ismail/)).toBeVisible();
        await expectBeads(page, 0, 1);
        await expectNotices(page);
        await expect(scene(page)).toHaveAttribute("data-state", "unsupported");
        await expect(page.locator("[data-still]")).toBeVisible();
        const [x, y] = await markerAt(page);
        expect(y, "the marker is on the side of Hijr Ismail").toBeLessThan(HIJR.centre[1]);
        expect((x / HIJR.across) ** 2 + ((y - HIJR.centre[1]) / HIJR.out) ** 2, "the marker is outside the wall").toBeGreaterThan(1);
        const message = page.getByText(MS.no3d, { exact: true });
        await expect(message).toBeVisible();
        expect((await message.boundingBox())!.y, "the message sits under the step panel").toBeGreaterThan((await page.locator(".vh-panel").boundingBox())!.y);
        await expect(page.getByRole("button", { name: MS.retry })).toHaveCount(0);

        await next(page).click();
        await expect(title(page)).toHaveText("Rukun Yamani");
        const [atX, atY] = await markerAt(page);
        expect(Math.hypot(atX - RUKUN_YAMANI[0], atY - RUKUN_YAMANI[1]), "the marker is at Rukun Yamani").toBeLessThan(12);
        expect(atX, "the marker is on the side of Rukun Yamani").toBeGreaterThan(0);
        expect(atY).toBeGreaterThan(0);
        expect(modelAsked).toBe(false);
      });

      test("the download of the 3D place fails on step 5, and Cuba lagi brings it back", async ({ page }) => {
        await page.route(MODEL, (route) => route.abort("internetdisconnected"));
        await page.goto("/#tawaf-5");
        await expect(title(page)).toHaveText("Hijr Ismail");
        await expect(scene(page)).toHaveAttribute("data-state", "failed", { timeout: 15_000 });
        await expect(page.locator("[data-still] [data-marker]")).toBeVisible();
        const message = page.getByText(MS.failed, { exact: true });
        await expect(message).toBeVisible();
        expect((await message.boundingBox())!.y, "the card sits above the step panel").toBeLessThan((await page.locator(".vh-panel").boundingBox())!.y);

        await page.unroute(MODEL);
        await page.route(MODEL, async (route) => {
          await new Promise((done) => setTimeout(done, 1500));
          await route.continue();
        });
        await page.getByRole("button", { name: MS.retry }).click();
        await expect(page.getByText(MS.loading, { exact: true })).toBeVisible();
        await expect(page).toHaveURL(/#tawaf-5$/);
        await expect(title(page)).toHaveText("Hijr Ismail");
        await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await expectCamera(page, 5);
      });

      test("the device drops 3D while the place downloads", async ({ page }) => {
        await page.route(MODEL, async (route) => {
          await new Promise((done) => setTimeout(done, 1500));
          await route.continue();
        });
        const asked = page.waitForRequest((request) => request.url().endsWith("/models/mataf.glb"));
        await page.goto("/");
        await asked;
        await page.locator("[data-scene] canvas").evaluate((canvas: HTMLCanvasElement) => {
          canvas.getContext("webgl2")!.getExtension("WEBGL_lose_context")!.loseContext();
        });
        await expect(scene(page)).toHaveAttribute("data-state", "failed", { timeout: 15_000 });
        await expect(page.locator("[data-still]")).toBeVisible();
        await expect(page.getByRole("button", { name: MS.retry })).toBeVisible();
      });
    });

    test.describe("English device", () => {
      test.use({ locale: "en-GB" });

      test("Ustaz Hafiz opens a step by its link, and the step holds", async ({ page, browser }) => {
        let modelLoads = 0;
        page.on("request", (request) => {
          if (request.url().endsWith("/models/mataf.glb")) modelLoads += 1;
        });
        await page.goto("/#tawaf-6");
        await expect(title(page)).toHaveText("Rukun Yamani");
        await expect(page.getByText(/^At this corner, touch Rukun Yamani/)).toBeVisible();
        await expectBeads(page, 0, 1);
        await expect(scene(page)).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await expectCamera(page, 6);
        const canvas = await page.locator("[data-scene] canvas").elementHandle();

        await page.keyboard.press("ArrowRight");
        await expect(title(page)).toHaveText("Between the two corners");
        await page.keyboard.press("PageUp");
        await expect(title(page)).toHaveText("Rukun Yamani");
        await page.keyboard.press("PageDown");
        await expect(title(page)).toHaveText("Between the two corners");
        await page.keyboard.press("ArrowLeft");
        await expect(title(page)).toHaveText("Rukun Yamani");

        await page.getByRole("button", { name: "BM" }).click();
        await expect(page.getByText(/^Di penjuru ini, sentuh Rukun Yamani/)).toBeVisible();
        await expect(title(page)).toHaveText("Rukun Yamani");
        await expect(scene(page)).toHaveAttribute("data-state", "shown");
        expect(await canvas!.evaluate((node) => node.isConnected)).toBe(true);
        expect(modelLoads).toBe(1);

        await page.reload();
        await expect(page.getByText(/^Di penjuru ini, sentuh Rukun Yamani/)).toBeVisible();

        await next(page).click();
        await expect(title(page)).toHaveText("Antara dua penjuru");
        await page.goBack();
        await expect(title(page)).toHaveText("Rukun Yamani");
        await expectCamera(page, 6);

        await page.goto("/#tawaf-99");
        await expect(title(page)).toHaveText("Kaabah dan bahagiannya");
        await page.goto("/#tawaf-6");
        await page.goto("/#abc");
        await expect(title(page)).toHaveText("Kaabah dan bahagiannya");

        const other = await browser.newContext({ locale: "id-ID", viewport: size });
        const fresh = await other.newPage();
        await fresh.goto("/");
        await expect(title(fresh)).toHaveText("Kaabah dan bahagiannya");
        await other.close();
      });
    });
  });
}

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 360, height: 800 }, locale: "ms-MY", reducedMotion: "reduce" });

  test("the camera cuts and does not fly", async ({ page }) => {
    const lines: string[] = [];
    page.on("console", (message) => lines.push(message.text()));
    await page.goto("/");
    await expectCamera(page, 1);
    await next(page).click();
    await expectCamera(page, 2);
    await expect.poll(() => lines.find((line) => line.startsWith("[isfar] camera at step 2"))).toMatch(/in 0 ms$/);
  });
});

test.describe("a projector at 200%", () => {
  test.use({ viewport: { width: 960, height: 540 }, locale: "ms-MY" });

  test("the Back and Next bar does not cover the note toggle when it takes focus", async ({ page }) => {
    await page.goto("/#tawaf-2");
    const toggle = page.locator("summary", { hasText: MS.note });
    for (let tab = 0; tab < 10 && !(await toggle.evaluate((summary) => summary === document.activeElement)); tab += 1) await page.keyboard.press("Tab");
    await expect(toggle).toBeFocused();
    await expect
      .poll(async () => (await toggle.boundingBox())!.y + (await toggle.boundingBox())!.height, "the toggle ends above the bar")
      .toBeLessThanOrEqual((await page.locator(".walk__actions").boundingBox())!.y);
  });
});

test.describe("a resize", () => {
  test.use({ viewport: { width: 1280, height: 720 }, locale: "ms-MY" });

  test("draws the place again at the new size", async ({ page }) => {
    await page.goto("/");
    await expectCamera(page, 1);
    await kaabahIsDrawn(page);
    const width = () => page.locator("[data-scene] canvas").evaluate((canvas: HTMLCanvasElement) => canvas.width);
    const before = await width();
    await page.setViewportSize({ width: 960, height: 540 });
    await expect.poll(width, "the canvas takes the new size").toBeLessThan(before);
    await kaabahIsDrawn(page);
  });
});
