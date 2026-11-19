import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { resetGoogleAccounts } from "./google-accounts";
import { SIGNED_IN_STATE, TEST_USER } from "./test-user";

test.use({ storageState: SIGNED_IN_STATE });

test.beforeEach(async () => {
  await resetGoogleAccounts();
});

// 帯。Next.js が画面の移動を読み上げるために置く role="alert" の部品は、main の外にあるので含めない
function banner(page: Page) {
  return page.getByRole("main").getByRole("alert");
}

// /settings へのサーバーアクションの通信（next-action の付いた POST）を、返事を返さずに止める（abort なら失敗させる）
async function holdServerActions(page: Page, mode: "hold" | "abort") {
  await page.route(
    (url) => url.pathname === "/settings",
    async (route) => {
      const request = route.request();
      const isAction =
        request.method() === "POST" && "next-action" in request.headers();
      if (!isAction) return route.continue();
      if (mode === "abort") return route.abort();
      // hold：返事を返さない
    },
  );
}

test("settings-default", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "端末に合わせる" }),
  ).toBeChecked();
  // 自分の Google アカウントがいちばん上に出て、外せない
  await expect(page.getByText(TEST_USER.email)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "外す", exact: true }),
  ).toHaveCount(0);
  await expect(page).toHaveScreenshot("settings-default.png", {
    fullPage: true,
  });
});

test("settings-dark：dark を押すと、その場で暗くなる", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "ダーク" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page).toHaveScreenshot("settings-dark.png", { fullPage: true });
});

test("light を押すと、OS が暗くても、その場で明るくなる", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/settings");
  await page.getByRole("radio", { name: "ライト" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("選んだ値を覚えていて、読み直しても暗く、dark が選ばれている", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "ダーク" }).click();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "ダーク" })).toBeChecked();
});

test("settings-linked：unlink を押すとその行が消え、足したものを全部外すと自分の Google アカウントだけが残る", async ({
  page,
}) => {
  await resetGoogleAccounts(["me@gmail.com", "me.work@gmail.com"]);
  await page.goto("/settings");
  await expect(page).toHaveScreenshot("settings-linked.png", {
    fullPage: true,
  });

  const unlinks = page.getByRole("button", { name: "外す", exact: true });
  await unlinks.first().click();
  await expect(page.getByText("me@gmail.com", { exact: true })).toBeHidden();
  await expect(page.getByText("me.work@gmail.com")).toBeVisible();

  await unlinks.first().click();
  await expect(page.getByText("me.work@gmail.com")).toBeHidden();
  await expect(unlinks).toHaveCount(0);
  await expect(page.getByText(TEST_USER.email)).toBeVisible();

  // 読み直しても戻らない（データベースから消えている）
  await page.reload();
  await expect(page.getByText("me.work@gmail.com")).toBeHidden();
});

test("settings-unlinking：外している間は、押した行のボタンが unlinking… になって押せない", async ({
  page,
}) => {
  await resetGoogleAccounts(["me@gmail.com", "me.work@gmail.com"]);
  await holdServerActions(page, "hold");
  await page.goto("/settings");
  await page.getByRole("button", { name: "外す", exact: true }).first().click();

  await expect(
    page.getByRole("button", { name: "外しています…" }),
  ).toBeDisabled();
  await expect(page).toHaveScreenshot("settings-unlinking.png", {
    fullPage: true,
  });
});

test("settings-unlink-error：外せなかったら、行を残して帯を出す", async ({
  page,
}) => {
  await resetGoogleAccounts(["me@gmail.com", "me.work@gmail.com"]);
  await holdServerActions(page, "abort");
  await page.goto("/settings");
  await page.getByRole("button", { name: "外す", exact: true }).first().click();

  await expect(banner(page)).toHaveText(
    "Google アカウントを外せませんでした。もう一度試してください。",
  );
  await expect(page.getByText("me@gmail.com", { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot("settings-unlink-error.png", {
    fullPage: true,
  });
});

test("settings-linking：Google に移るまでの間は、link google account が linking… になって押せない", async ({
  page,
}) => {
  await holdServerActions(page, "hold");
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Google アカウントを紐づける" })
    .click();

  await expect(
    page.getByRole("button", { name: "紐づけています…" }),
  ).toBeDisabled();
  await expect(page).toHaveScreenshot("settings-linking.png", {
    fullPage: true,
  });
});

test("settings-link-error：紐づけに失敗して戻ってくると、帯を出す", async ({
  page,
}) => {
  // Google から戻ってきたときの URL（Better Auth が error を付ける）を直接開く
  await page.goto("/settings?error=invalid_code");

  await expect(banner(page)).toHaveText(
    "Google アカウントを紐づけられませんでした。もう一度試してください。",
  );
  await expect(page).toHaveScreenshot("settings-link-error.png", {
    fullPage: true,
  });
});
