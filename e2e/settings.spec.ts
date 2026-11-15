import { expect, test } from "./fixtures";
import { SIGNED_IN_STATE } from "./test-user";

test.use({ storageState: SIGNED_IN_STATE });

test("settings-default", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("radio", { name: "system" })).toBeChecked();
  await expect(page).toHaveScreenshot("settings-default.png", {
    fullPage: true,
  });
});

test("settings-dark：dark を押すと、その場で暗くなる", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page).toHaveScreenshot("settings-dark.png", { fullPage: true });
});

test("light を押すと、OS が暗くても、その場で明るくなる", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/settings");
  await page.getByRole("radio", { name: "light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("選んだ値を覚えていて、読み直しても暗く、dark が選ばれている", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "dark" }).click();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "dark" })).toBeChecked();
});
