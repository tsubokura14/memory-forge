import { chromium, type FullConfig } from "@playwright/test";
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
  try {
    const db = drizzle({ client: pool, schema });
    // questions は subjects を消すと一緒に消える
    await db.delete(schema.subjects);
    await db.delete(schema.signInAttempts);
    await db.delete(schema.session);
    await db.delete(schema.account);
    await db.delete(schema.verification);
    await db.delete(schema.user);
    await createUser(db, TEST_USER);
  } finally {
    await pool.end();
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    baseURL: config.projects[0].use.baseURL,
  });
  await page.goto("/login");
  await page.getByLabel("email").fill(TEST_USER.email);
  await page.getByLabel("password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "sign in" }).click();
  await page.waitForURL("/");
  await page.context().storageState({ path: SIGNED_IN_STATE });
  await browser.close();
}
