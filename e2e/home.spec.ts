import { expect, test } from "./fixtures";
import { resetQuestions, testQuestion } from "./questions";
import { SIGNED_IN_STATE, TEST_USER } from "./test-user";

test.describe("ログインした状態を保存したもので開く", () => {
  test.use({ storageState: SIGNED_IN_STATE });

  test("home-empty", async ({ page }) => {
    await resetQuestions();
    await page.goto("/");
    await expect(page.getByText("No subjects yet.")).toBeVisible();
    await expect(page).toHaveScreenshot("home-empty.png", { fullPage: true });
  });

  test("Subject が1つ以上あると、subjects の見出しを出さない", async ({
    page,
  }) => {
    await resetQuestions([
      { name: "Python", questions: [testQuestion("a1x9k2")] },
    ]);
    await page.goto("/");
    // 読み込み中の枠が消えて、Subject を読み終えるのを待つ
    await expect(page.getByTestId("subjects-loading")).toHaveCount(0);
    await expect(page.getByText("subjects", { exact: true })).toHaveCount(0);
    await expect(page).toHaveScreenshot("home-default.png", { fullPage: true });
  });
});

// sign out するとセッションが消えるので、保存したログインの状態を使わず、ここで sign in したセッションで試す
test("sign out すると Login に移り、戻っても中身は見えない", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("email").fill(TEST_USER.email);
  await page.getByLabel("password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "sign in" }).click();
  await expect(page).toHaveURL("/");

  await page.getByRole("button", { name: "sign out" }).click();
  await expect(page).toHaveURL("/login");

  await page.goBack();
  await expect(page).toHaveURL(/^[^?]*\/login\?next=%2F$/);
  await expect(page.getByRole("button", { name: "sign in" })).toBeVisible();
});
