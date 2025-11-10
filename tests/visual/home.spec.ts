import { expect, test } from "@playwright/test";

test.describe("Home page visual regression", () => {
  test("matches desktop baseline", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts?.ready);

    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot("home-desktop.png");
  });
});

