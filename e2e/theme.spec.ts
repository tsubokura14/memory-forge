import { expect, test } from "./fixtures";

// 明るさの仕組み（docs/design.md の「テーマ」）。ログインしていない状態の Login で確かめる

test("選んだことがなければ、OS の設定に合わせ、OS を変えるとその場で変わる", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("端末に dark を覚えていれば、OS が明るくても、読み直しても暗い", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("theme", "dark"));

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
