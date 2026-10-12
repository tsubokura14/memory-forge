import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// webServer で立ち上げるアプリを、test のデータベースにつなぐ。すでにある環境変数は Next.js が .env.local より先に使う。
// CI には .env.test がなく、接続先は環境変数で渡す
if (existsSync(".env.test")) {
  process.loadEnvFile(".env.test");
}

// Playwright 公式の Docker イメージの中で動かす（scripts/screens.mjs、CI）。手元の OS で直接動かすと、文字の描き方が違って基準の画像と一致しない
export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  // CI では、失敗したときに基準・今回・差分の画像を開けるように、HTML のレポートも作る
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  // 基準の画像は、OS 名を入れずに docs/specs/screens/<画面>-<状態>.png に置く
  snapshotPathTemplate: "docs/specs/screens/{arg}{ext}",
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
