import { defineConfig } from "@playwright/test";

const local = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      testIgnore: /speed\.spec\.ts/,
      use: { browserName: "chromium", baseURL: local },
    },
    {
      name: "firefox",
      testIgnore: /speed\.spec\.ts/,
      use: { browserName: "firefox", baseURL: local },
    },
    {
      name: "speed",
      testMatch: /speed\.spec\.ts/,
      timeout: 60_000,
      use: { browserName: "chromium", channel: "chrome", headless: false, baseURL: process.env.SPEED_URL },
    },
  ],
  webServer: process.env.SPEED_URL
    ? undefined
    : {
        command: "pnpm build && pnpm preview --host 127.0.0.1 --port 4173 --strictPort",
        url: local,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
