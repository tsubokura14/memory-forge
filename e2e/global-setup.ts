import { chromium, type FullConfig } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createUser } from "../scripts/insert-user";
import { withVerifyFull } from "../src/server/db/connection-url";
import * as schema from "../src/server/db/schema";
import { signedInCookies } from "./session";
import { SIGNED_IN_STATE, TEST_USER } from "./test-user";

// テストの前に、データベースを空にしてテスト用のユーザーを作り、ログインした状態を保存する
export default async function globalSetup(config: FullConfig) {
  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  try {
    const db = drizzle({ client: pool, schema });
    // questions は subjects を消すと一緒に消える
    await db.delete(schema.subjects);
    await db.delete(schema.session);
    await db.delete(schema.account);
    await db.delete(schema.verification);
    await db.delete(schema.user);
    await createUser(db, TEST_USER);
  } finally {
    await pool.end();
  }

  const baseURL = config.projects[0].use.baseURL ?? "";
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  await context.addCookies(await signedInCookies(baseURL));
  await context.storageState({ path: SIGNED_IN_STATE });
  await browser.close();
}
