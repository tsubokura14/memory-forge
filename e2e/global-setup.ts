import { chromium, type FullConfig } from "@playwright/test";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { testUtils } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createUser } from "../scripts/insert-user";
import { withVerifyFull } from "../src/server/db/connection-url";
import * as schema from "../src/server/db/schema";
import { SIGNED_IN_STATE, TEST_USER } from "./test-user";

// テストの前に、データベースを空にしてテスト用のユーザーを作り、ログインした状態を保存する。
// 間違えた回数も消すので、前の実行で止めたメールアドレスが残らない
export default async function globalSetup(config: FullConfig) {
  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  let cookies;
  try {
    const db = drizzle({ client: pool, schema });
    // questions は subjects を消すと一緒に消える
    await db.delete(schema.subjects);
    await db.delete(schema.signInAttempts);
    await db.delete(schema.session);
    await db.delete(schema.account);
    await db.delete(schema.verification);
    await db.delete(schema.user);
    const { id: userId } = await createUser(db, TEST_USER);

    // docs/design.md の「画面の画像を撮る・比べる仕組み」
    const testAuth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg", schema }),
      plugins: [testUtils()],
    });
    const { test } = await testAuth.$context;
    cookies = await test.getCookies({
      userId,
      domain: new URL(config.projects[0].use.baseURL ?? "").hostname,
    });
  } finally {
    await pool.end();
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: config.projects[0].use.baseURL,
  });
  await context.addCookies(cookies);
  await context.storageState({ path: SIGNED_IN_STATE });
  await browser.close();
}
