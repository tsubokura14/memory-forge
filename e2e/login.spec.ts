import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { SIGNED_IN_STATE } from "./test-user";

// 帯。Next.js が画面の移動を読み上げるために置く role="alert" の部品は、main の外にあるので含めない
function banner(page: Page) {
  return page.getByRole("main").getByRole("alert");
}

// サーバーアクションの通信（next-action の付いた POST）だけを選ぶ
function isServerAction(request: { method(): string; headers(): object }) {
  return request.method() === "POST" && "next-action" in request.headers();
}

test("login-default", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveScreenshot("login-default.png", { fullPage: true });
});

test("Google に移るまでの間は、ボタンがログインしています… になって押せない", async ({
  page,
}) => {
  // 返事を返さずに止めて、移っている間の画面を撮る
  await page.route(
    (url) => url.pathname === "/login",
    async (route) => {
      if (!isServerAction(route.request())) await route.continue();
    },
  );
  await page.goto("/login");
  await page.getByRole("button", { name: "Google でログインする" }).click();

  await expect(
    page.getByRole("button", { name: "ログインしています…" }),
  ).toBeDisabled();
  await expect(page).toHaveScreenshot("login-loading.png", { fullPage: true });
});

test("ログインしていないと、開こうとしていた画面を next に付けて Login に移る", async ({
  page,
}) => {
  await page.goto("/missing?tab=1");
  await expect(page).toHaveURL("/login?next=%2Fmissing%3Ftab%3D1");
});

test("サーバーにつながらないと、エラーの帯が出る", async ({ page }) => {
  await page.route(
    (url) => url.pathname === "/login",
    (route) =>
      isServerAction(route.request()) ? route.abort() : route.continue(),
  );
  await page.goto("/login");
  await page.getByRole("button", { name: "Google でログインする" }).click();

  await expect(banner(page)).toHaveText(
    "ログインできませんでした。もう一度お試しください。",
  );
  await expect(page).toHaveScreenshot("login-server-error.png", {
    fullPage: true,
  });
});

test("紐づけていない Google アカウントで戻ってくると、帯が出る", async ({
  page,
}) => {
  // Google から戻ってきたときの URL（Better Auth が error を付ける）を直接開く
  await page.goto("/login?error=signup_disabled");

  await expect(banner(page)).toHaveText(
    "この Google アカウントは紐づけられていません。",
  );
  await expect(page).toHaveScreenshot("login-google-error.png", {
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
