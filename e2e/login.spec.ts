import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { SIGNED_IN_STATE, TEST_USER } from "./test-user";

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel("email").fill(email);
  await page.getByLabel("password").fill(password);
  await page.getByRole("button", { name: "sign in" }).click();
}

// サーバーアクションの通信（next-action の付いた POST）だけを選ぶ
function isServerAction(request: { method(): string; headers(): object }) {
  return request.method() === "POST" && "next-action" in request.headers();
}

test("login-default", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveScreenshot("login-default.png", { fullPage: true });
});

test("送っている間は、ボタンが signing in… になって押せない", async ({
  page,
}) => {
  // 返事を返さずに止めて、送っている間の画面を撮る
  await page.route(
    (url) => url.pathname === "/login",
    async (route) => {
      if (!isServerAction(route.request())) await route.continue();
    },
  );
  await page.goto("/login");
  await signIn(page, TEST_USER.email, TEST_USER.password);

  await expect(
    page.getByRole("button", { name: "signing in…" }),
  ).toBeDisabled();
  await expect(page.getByLabel("email")).toBeDisabled();
  await expect(page).toHaveScreenshot("login-loading.png", { fullPage: true });
});

test("ログインしていないと Login に移り、sign in すると開こうとしていた画面に移る", async ({
  page,
}) => {
  await page.goto("/missing?tab=1");
  await expect(page).toHaveURL("/login?next=%2Fmissing%3Ftab%3D1");

  await signIn(page, TEST_USER.email, TEST_USER.password);
  await expect(page).toHaveURL("/missing?tab=1");
});

test("Login を直接開いて sign in すると Home に移る", async ({ page }) => {
  await page.goto("/login");
  await signIn(page, TEST_USER.email, TEST_USER.password);
  await expect(page).toHaveURL("/");
});

test("違うと帯が出て、入れた値が残る", async ({ page }) => {
  await page.goto("/login");
  await signIn(page, TEST_USER.email, "wrong-password");

  await expect(page.getByRole("alert")).toHaveText(
    "Incorrect email or password.",
  );
  await expect(page.getByLabel("email")).toHaveValue(TEST_USER.email);
  await expect(page.getByLabel("password")).toHaveValue("wrong-password");
  await expect(page).toHaveScreenshot("login-error.png", { fullPage: true });
});

test("5回続けて間違えると、止めている帯が出る", async ({ page }) => {
  await page.goto("/login");
  // 登録されていないメールアドレスで試す（テスト用のユーザーを止めないため）
  for (let i = 1; i <= 4; i++) {
    await signIn(page, "stranger@example.com", `guess-${i}`);
    await expect(page.getByRole("alert")).toHaveText(
      "Incorrect email or password.",
    );
  }
  await signIn(page, "stranger@example.com", "guess-5");

  await expect(page.getByRole("alert")).toHaveText(
    "Too many attempts. Try again in 15 minutes.",
  );
  await expect(page).toHaveScreenshot("login-locked.png", { fullPage: true });
});

test("サーバーにつながらないと、エラーの帯が出る", async ({ page }) => {
  await page.route(
    (url) => url.pathname === "/login",
    (route) =>
      isServerAction(route.request()) ? route.abort() : route.continue(),
  );
  await page.goto("/login");
  await signIn(page, TEST_USER.email, TEST_USER.password);

  await expect(page.getByRole("alert")).toHaveText(
    "Couldn't sign in. Please try again.",
  );
  await expect(page).toHaveScreenshot("login-server-error.png", {
    fullPage: true,
  });
});

test.describe("ログインしているとき", () => {
  test.use({ storageState: SIGNED_IN_STATE });

  test("Login を開くと Home に移る", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});
