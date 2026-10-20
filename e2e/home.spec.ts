import { expect, test } from "./fixtures";
import { SIGNED_IN_STATE } from "./test-user";

test.use({ storageState: SIGNED_IN_STATE });

test("home-default", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home-default.png", { fullPage: true });
});
