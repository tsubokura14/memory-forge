import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { withVerifyFull } from "../src/server/db/connection-url";
import * as schema from "../src/server/db/schema";
import { TEST_USER } from "./test-user";

// 画面のテストで、テスト用のユーザーに紐づけた Google アカウントを入れ直す。
// 本物の Google の画面は通せないので、Better Auth が紐づけたときと同じ形の account の行を直接入れる
export async function resetGoogleAccounts(emails: string[] = []) {
  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  try {
    const db = drizzle({ client: pool, schema });
    const [owner] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, TEST_USER.email));
    await db
      .delete(schema.account)
      .where(
        and(
          eq(schema.account.userId, owner.id),
          eq(schema.account.providerId, "google"),
        ),
      );
    // 紐づけた順に並ぶので、1秒ずつずらして入れる
    for (const [i, email] of emails.entries()) {
      const linkedAt = new Date(Date.UTC(2026, 10, 1, 0, 0, i));
      await db.insert(schema.account).values({
        id: randomUUID(),
        accountId: randomUUID(),
        providerId: "google",
        userId: owner.id,
        idToken: fakeIdToken(email),
        createdAt: linkedAt,
        updatedAt: linkedAt,
      });
    }
  } finally {
    await pool.end();
  }
}

// Google の ID トークンと同じ形（ヘッダー.中身.署名）。アプリは中身の email だけを読む
function fakeIdToken(email: string) {
  const part = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "RS256" })}.${part({ email })}.sig`;
}
