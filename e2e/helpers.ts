import { expect, type Page } from "@playwright/test";

// What the walk and the check browser tests share.
export const SIZES = [
  { width: 360, height: 800 },
  { width: 960, height: 540 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
];

export const NOTICE = {
  review: "Kandungan ini belum disemak oleh orang yang bertauliah.",
  layout: "Susun atur pada hari sebenar mungkin berbeza. Ikut mutawwif anda dan papan tanda.",
};

export const MODEL = "**/models/mataf.glb";

export const title = (page: Page) => page.getByRole("heading", { level: 1 });
export const scene = (page: Page) => page.locator("[data-scene]");
export const names = (page: Page) => page.locator("[data-scene] .scene__name").filter({ visible: true });

export async function expectNotices(page: Page) {
  await expect(page.getByText(NOTICE.review, { exact: true })).toBeAttached();
  await expect(page.getByText(NOTICE.layout, { exact: true })).toBeAttached();
}

export async function expectBeads(page: Page, done: number, now: number | null) {
  const beads = page.locator(".vh-panel .vh-bead");
  await expect(beads).toHaveCount(7);
  await expect(page.locator(".vh-panel .vh-bead--done")).toHaveCount(done);
  if (now === null) await expect(page.locator(".vh-panel .vh-bead--now")).toHaveCount(0);
  else await expect(beads.nth(now - 1)).toHaveClass(/vh-bead--now/);
}

// The camera is at the view of a step when the place says so, and no move is under way.
export async function expectCamera(page: Page, step: number) {
  await expect(scene(page)).toHaveAttribute("data-camera", String(step), { timeout: 15_000 });
  await expect(scene(page)).not.toHaveAttribute("data-moving", "true");
}

// The page decodes a screenshot of the canvas, and reads the light of one pixel.
export async function lightAt(page: Page, x: number, y: number) {
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

// A marker on the map, back in the plan's metres. The map draws y down.
export async function markerAt(page: Page): Promise<[number, number]> {
  const marker = page.locator("[data-marker]");
  return [Number(await marker.getAttribute("cx")), -Number(await marker.getAttribute("cy"))];
}

export const noWebGL = () => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    if (type.includes("webgl")) return null;
    return original.call(this, type, ...(rest as []));
  } as typeof original;
};
