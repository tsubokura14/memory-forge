import { test as base } from "@playwright/test";

// docs/design.md の「画面の画像を撮る・比べる仕組み」
export const test = base.extend({
  // 2つめの引数をふつうの名前の use にすると、ESLint が React の use と取り違えて止めるので、名前を変えている
  page: async ({ page }, runTest) => {
    await page.clock.setFixedTime(new Date("2026-01-15T09:00:00+09:00"));
    await runTest(page);
  },
});

export { expect } from "@playwright/test";
