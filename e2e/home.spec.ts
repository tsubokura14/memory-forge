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

  test("home-default：Subject を取り込んだ順に並べ、押すと Setup に移る", async ({
    page,
  }) => {
    const names = ["AWS SAA", "Python", "TypeScript", "Linux"];
    const ids = await resetQuestions(
      names.map((name, i) => ({ name, questions: [testQuestion(`q${i}`)] })),
    );
    await page.goto("/");
    const subjects = page.getByRole("list", { name: "subjects" });
    const links = subjects.getByRole("link");
    await expect(links).toHaveCount(names.length);
    // 文字には印（chevron_right）も入るので、印を除いた名前で比べる
    for (const [i, name] of names.entries()) {
      await expect(links.nth(i)).toHaveAccessibleName(name);
    }
    await expect(page).toHaveScreenshot("home-default.png", { fullPage: true });

    await subjects.getByRole("link", { name: "Python" }).click();
    await expect(page).toHaveURL(`/subjects/${ids[1]}`);
  });

  test("home-many", async ({ page }) => {
    const base = [
      "AWS SAA",
      "AWS DVA",
      "Python",
      "TypeScript",
      "Linux",
      "Docker",
      "Kubernetes",
      "SQL",
    ];
    const names = [
      ...base,
      ...base.map((name) => `${name} 2`),
      ...base.map((name) => `${name} 3`),
    ];
    await resetQuestions(
      names.map((name, i) => ({ name, questions: [testQuestion(`q${i}`)] })),
    );
    await page.goto("/");
    await expect(
      page.getByRole("list", { name: "subjects" }).getByRole("link"),
    ).toHaveCount(names.length);
    await expect(page).toHaveScreenshot("home-many.png", { fullPage: true });
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
