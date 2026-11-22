import { expect, test, type Page } from "@playwright/test";

const SIZES = [
  { width: 360, height: 800 },
  { width: 960, height: 540 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
];

const MS = {
  title: "Kaabah",
  text: "Inilah Kaabah, di tengah-tengah Masjidil Haram. Lantai marmar yang lapang di sekelilingnya dipanggil mataf.",
  review: "Kandungan ini belum disemak oleh orang yang bertauliah.",
  layout: "Susun atur pada hari sebenar mungkin berbeza. Ikut mutawwif anda dan papan tanda.",
  no3d: "Peranti ini tidak dapat memaparkan tempat 3D.",
  failed: "Tempat 3D tidak dapat dimuatkan.",
  retry: "Cuba lagi",
  loading: "Memuatkan Kaabah",
};

const EN = {
  title: "The Kaabah",
  text: "This is the Kaabah, in the centre of Masjidil Haram. The open marble floor around it is the mataf.",
  review: "A qualified person has not yet reviewed this content.",
  layout: "The layout on the day may differ. Follow your mutawwif and the signs.",
};

const MODEL = "**/models/kaabah.glb";

async function expectStep(page: Page, words: typeof EN) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(words.title);
  await expect(page.getByText(words.text, { exact: true })).toBeVisible();
  await expect(page.getByText(words.review, { exact: true })).toBeAttached();
  await expect(page.getByText(words.layout, { exact: true })).toBeAttached();
}

// The page decodes a screenshot of the canvas, and reads the pixel where the Kaabah stands.
async function kaabahIsDrawn(page: Page) {
  const canvas = page.locator("[data-scene] canvas");
  await expect(canvas).toBeVisible();
  const png = (await canvas.screenshot()).toString("base64");
  const light = await page.evaluate(async (data) => {
    const image = await createImageBitmap(await (await fetch("data:image/png;base64," + data)).blob());
    const sheet = new OffscreenCanvas(image.width, image.height).getContext("2d")!;
    sheet.drawImage(image, 0, 0);
    const [r, g, b] = sheet.getImageData(Math.round(image.width * 0.5), Math.round(image.height * 0.45), 1, 1).data;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }, png);
  expect(light, "the kiswah is dark at the centre of the scene").toBeLessThan(80);
}

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size });

    test.describe("Malay device", () => {
      test.use({ locale: "ms-MY" });

      test("a person sees the place and reads the step in Malay", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("header")).toContainText("Isfar");
        await expectStep(page, MS);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
        await expect(page.locator("[data-scene]")).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await kaabahIsDrawn(page);
      });

      test("the device cannot draw 3D", async ({ page }) => {
        await page.addInitScript(() => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
            if (type.includes("webgl")) return null;
            return original.call(this, type, ...(rest as []));
          } as typeof original;
        });
        let modelAsked = false;
        page.on("request", (request) => {
          if (request.url().endsWith("/models/kaabah.glb")) modelAsked = true;
        });
        await page.goto("/");
        await expectStep(page, MS);
        await expect(page.locator("[data-scene]")).toHaveAttribute("data-state", "unsupported");
        await expect(page.locator("[data-still]")).toBeVisible();
        await expect(page.getByText(MS.no3d, { exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: MS.retry })).toHaveCount(0);
        expect(modelAsked).toBe(false);
      });

      test("the download of the 3D place fails, and Cuba lagi brings it back", async ({ page }) => {
        await page.route(MODEL, (route) => route.abort("internetdisconnected"));
        await page.goto("/");
        await expectStep(page, MS);
        await expect(page.locator("[data-scene]")).toHaveAttribute("data-state", "failed", { timeout: 15_000 });
        await expect(page.locator("[data-still]")).toBeVisible();
        await expect(page.getByText(MS.failed, { exact: true })).toBeVisible();

        await page.unroute(MODEL);
        await page.route(MODEL, async (route) => {
          await new Promise((done) => setTimeout(done, 1500));
          await route.continue();
        });
        await page.getByRole("button", { name: MS.retry }).click();
        await expect(page.getByText(MS.loading, { exact: true })).toBeVisible();
        await expect(page.locator("[data-scene]")).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        await kaabahIsDrawn(page);
      });
    });

    test.describe("English device", () => {
      test.use({ locale: "en-GB" });

      test("a person switches language and the site remembers it", async ({ page, browser }) => {
        let modelLoads = 0;
        page.on("request", (request) => {
          if (request.url().endsWith("/models/kaabah.glb")) modelLoads += 1;
        });
        await page.goto("/");
        await expectStep(page, EN);
        const scene = page.locator("[data-scene]");
        await expect(scene).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
        const canvas = await page.locator("[data-scene] canvas").elementHandle();

        await page.getByRole("button", { name: "BM" }).click();
        await expectStep(page, MS);
        await expect(scene).toHaveAttribute("data-state", "shown");
        expect(await canvas!.evaluate((node) => node.isConnected)).toBe(true);
        expect(modelLoads).toBe(1);

        await page.reload();
        await expectStep(page, MS);

        const other = await browser.newContext({ locale: "id-ID", viewport: size });
        const fresh = await other.newPage();
        await fresh.goto("/");
        await expectStep(fresh, MS);
        await other.close();
      });
    });
  });
}
