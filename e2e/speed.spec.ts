import { expect, test } from "@playwright/test";

// Scenario 5 of tawaf-walk and of sai-walk, run by hand against the live site: SPEED_URL=https://isfar-57q.pages.dev pnpm e2e:speed
// It drives real Chrome with a window, because CI draws 3D in software and its frame rate means nothing.
const WALKS = [
  { name: "the mataf", address: "/", steps: 15 },
  { name: "the mas'a", address: "/#sai-1", steps: 13 },
];

for (const walk of WALKS) test(`${walk.name} runs at old-phone speed`, async ({ page }) => {
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
  await page.goto(walk.address);

  const scene = page.locator("[data-scene]");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await scene.getAttribute("data-state"), "the step text shows before the 3D place").not.toBe("shown");

  await expect(scene).toHaveAttribute("data-state", "shown", { timeout: 15_000 });
  const shownAt = await page.evaluate(() => performance.getEntriesByName("isfar:place-shown")[0].startTime);
  console.log(`place shown in ${Math.round(shownAt)} ms`);
  expect(shownAt).toBeLessThan(5_000);

  // A software renderer draws on the CPU, so its frame rate says nothing about a phone's graphics chip.
  const renderer = await page.evaluate(() => (window as unknown as { renderer: string }).renderer);
  console.log(`renderer: ${renderer}`);
  expect(renderer, "the renderer must be known").not.toBe("unknown");
  expect(renderer, "run on a machine with a graphics chip").not.toMatch(/swiftshader|llvmpipe|software/i);

  // Step 1 to the last step, one step each 2 seconds. The place logs the frames of each camera move.
  for (let step = 2; step <= walk.steps; step += 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(2_000);
  }
  await expect(scene).toHaveAttribute("data-camera", String(walk.steps));
  // A move to the same view, as from tawaf step 8 to step 9, cuts in 0 ms and draws one frame.
  // The first frame of a move is at 0 ms, so N frames span N - 1 gaps.
  const moves = lines.flatMap((line) => {
    const move = /camera at step (\d+): (\d+) frames in (\d+) ms/.exec(line);
    return move && Number(move[3]) > 0 ? [{ step: move[1], rate: (Number(move[2]) - 1) / (Number(move[3]) / 1000) }] : [];
  });
  expect(moves.length, "the camera flies between the spots").toBeGreaterThan(0);
  for (const { step, rate } of moves) {
    console.log(`move to step ${step}: ${Math.round(rate)} frames a second`);
    expect(rate, `the move to step ${step}`).toBeGreaterThanOrEqual(30);
  }
});
