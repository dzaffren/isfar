import { expect, test } from "@playwright/test";

// Scenario 5, run by hand against the live site: SPEED_URL=https://isfar-57q.pages.dev pnpm e2e:speed
// It drives real Chrome with a window, because CI draws 3D in software and its frame rate means nothing.
test("the place runs at old-phone speed", async ({ page }) => {
  test.skip(!process.env.SPEED_URL, "Set SPEED_URL to the live site.");
  await page.setViewportSize({ width: 360, height: 800 });

  // Chrome DevTools' "Fast 4G" preset, copied from front_end/core/sdk/NetworkManager.ts, and a CPU slowed 4 times.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 60 * 2.75,
    downloadThroughput: ((9 * 1000 * 1000) / 8) * 0.9,
    uploadThroughput: ((1.5 * 1000 * 1000) / 8) * 0.9,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const lines: string[] = [];
  page.on("console", (message) => lines.push(message.text()));
  // Read the renderer before the site makes its own contexts; a later probe can get no context at all.
  await page.addInitScript(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    (window as unknown as { renderer: string }).renderer = info ? String(gl!.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "unknown";
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  });
  await page.goto("/");

  const scene = page.locator("[data-scene]");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await scene.getAttribute("data-state"), "the step text shows before the 3D place").not.toBe("shown");

  await expect(scene).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
  const shownAt = await page.evaluate(() => performance.getEntriesByName("isfar:place-shown")[0].startTime);
  console.log(`place shown in ${Math.round(shownAt)} ms`);
  expect(shownAt).toBeLessThan(5_000);

  await expect.poll(() => lines.find((line) => line.includes("frames a second")), { timeout: 20_000 }).toBeTruthy();
  // A software renderer draws on the CPU, so its frame rate says nothing about a phone's graphics chip.
  const renderer = await page.evaluate(() => (window as unknown as { renderer: string }).renderer);
  console.log(`renderer: ${renderer}`);
  expect(renderer, "the renderer must be known").not.toBe("unknown");
  expect(renderer, "run on a machine with a graphics chip").not.toMatch(/swiftshader|llvmpipe|software/i);

  const rate = Number(/(\d+) frames a second/.exec(lines.find((line) => line.includes("frames a second"))!)![1]);
  console.log(`${rate} frames a second over 10 s`);
  expect(rate).toBeGreaterThanOrEqual(30);
});
