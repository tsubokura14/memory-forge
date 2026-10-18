import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// データベースを使うテストを、test のデータベースにつなぐ。CI には .env.test がなく、接続先は環境変数で渡す
if (existsSync(".env.test")) {
  process.loadEnvFile(".env.test");
}

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
    // テストがまだ1つもない間も、npm test を失敗にしないため
    passWithNoTests: true,
  },
});
