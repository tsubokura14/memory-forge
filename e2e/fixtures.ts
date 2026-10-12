import { test as base } from "@playwright/test";

// 画面のテストは、ここの test を使う。撮るたびに画像が変わらないように、ブラウザの日時を固定する
export const test = base.extend({
  // 2つめの引数をふつうの名前の use にすると、ESLint が React の use と取り違えて止めるので、名前を変えている
  page: async ({ page }, runTest) => {
    await page.clock.setFixedTime(new Date("2026-01-15T09:00:00+09:00"));
    await runTest(page);
  },
});

export { expect } from "@playwright/test";
