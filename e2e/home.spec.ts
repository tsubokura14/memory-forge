import { expect, test } from "./fixtures";

test("home-default", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home-default.png", { fullPage: true });
});
