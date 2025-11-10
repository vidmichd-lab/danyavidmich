import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/visual",
  timeout: 60_000,
  fullyParallel: false,
  expect: {
    toMatchSnapshot: {
      threshold: 0.01
    }
  },
  use: {
    baseURL: "http://127.0.0.1:4321",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    javaScriptEnabled: true,
    permissions: ["clipboard-read", "clipboard-write"],
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions: {
      slowMo: process.env.CI ? 0 : 50
    }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "npm run preview -- --port=4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe"
  }
});

