// 自分のアカウントを作る、または自分の Google アカウントのメールアドレスに合わせる（アプリの画面には登録の手段がないため）。
// 使い方：npm run user:create -- --env-file=<接続先を書いた .env のファイル>
// メールアドレスは、同じファイルの OWNER_GOOGLE_EMAIL から読む（docs/design.md の「データ」）。
//
// node が型を外して直接動かすので、ここから読み込むプロジェクトのファイルは、拡張子付きで書き、
// `@/` の別名を使わないもの（schema.ts・connection-url.ts・insert-user.ts）だけにする
import { parseArgs } from "node:util";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { withVerifyFull } from "../src/server/db/connection-url.ts";
import * as schema from "../src/server/db/schema.ts";
import { createUser } from "./insert-user.ts";

async function main() {
  const { values } = parseArgs({ options: { "env-file": { type: "string" } } });
  const envFile = values["env-file"];
  if (!envFile) {
    throw new Error(
      "接続先を --env-file=<ファイル> で指定する（例：npm run user:create -- --env-file=.env.local）",
    );
  }
  process.loadEnvFile(envFile);

  const email = process.env.OWNER_GOOGLE_EMAIL?.trim();
  if (!email) {
    throw new Error(`${envFile} に OWNER_GOOGLE_EMAIL を書く`);
  }

  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  try {
    await createUser(drizzle({ client: pool, schema }), { email });
  } finally {
    await pool.end();
  }
  console.log(`合わせた：${email.toLowerCase()}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  // Drizzle は SQL の文だけを message にし、データベースが返した理由（表がないなど）は cause に入れる
  if (error instanceof Error && error.cause instanceof Error) {
    console.error(`理由：${error.cause.message}`);
  }
  process.exitCode = 1;
});
