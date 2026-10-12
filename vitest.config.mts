import { defineConfig } from "vitest/config";

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
