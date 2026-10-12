import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    acceptDownloads: true,
    launchOptions: { args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Tests run against the static export: `npm run build` first.
  webServer: {
    command: `node scripts/serve.mjs out ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
