import { test, expect } from "@playwright/test";

test.describe("platform smoke", () => {
  test("home renders Faraday brand", async ({ page }) => {
    test.skip(
      process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1" &&
        !process.env.PLAYWRIGHT_BASE_URL,
      "no server",
    );
    await page.goto("/");
    await expect(page.getByText("Faraday", { exact: true }).first()).toBeVisible();
  });
});
