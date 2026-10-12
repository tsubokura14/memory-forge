import { defineConfig } from "drizzle-kit";

// 接続先は、手元では npm のコマンドが `node --env-file` で読み込ませる（package.json の db:migrate）。
// Vercel では Neon の連携が入れる。形の変更はプールを通さずに当てるので、直接つなぐ DATABASE_URL_UNPOOLED があればそちらを使う
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
