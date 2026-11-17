import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { testUtils } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { withVerifyFull } from "../src/server/db/connection-url";
import * as schema from "../src/server/db/schema";
import { TEST_USER } from "./test-user";

// テスト用のユーザーの新しいセッションを作り、ブラウザに入れる cookie を返す（docs/design.md の「画面の画像を撮る・比べる仕組み」）。
// global setup と、sign out でセッションを消すテストが使う
export async function signedInCookies(baseURL: string) {
  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  try {
    const db = drizzle({ client: pool, schema });
    const [owner] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, TEST_USER.email));
    const testAuth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg", schema }),
      plugins: [testUtils()],
    });
    const { test } = await testAuth.$context;
    return await test.getCookies({
      userId: owner.id,
      domain: new URL(baseURL).hostname,
    });
  } finally {
    await pool.end();
  }
}
