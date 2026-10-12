import { defineConfig } from "drizzle-kit";

// 接続先は、npm のコマンドが `node --env-file` で読み込ませる（package.json の db:migrate）
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
