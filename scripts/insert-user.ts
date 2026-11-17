// アカウントの行を入れる関数。scripts/create-user.ts と、テスト（Vitest・Playwright の global setup）から使う。
// Playwright は package.json に "type": "module" がないとファイルを CommonJS として読み、
// import.meta を使うファイル（create-user.ts）を読み込めないので、ここに分けている
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../src/server/db/schema.ts";

// アカウント（user の行）を1つにそろえる。なければ作り、あれば email を合わせる（docs/design.md の「データ」）。
// email_verified は true にする。Better Auth は、これが true でないと Login で Google アカウントを自動で紐づけないため。
// password は、パスワードで入る機能のテストだけが渡す（パスワードの機能と一緒に消す）。渡したときは、作るときだけ Better Auth の sign up と同じ形の account（credential）の行も入れる
export async function createUser(
  db: NodePgDatabase<typeof schema>,
  input: { email: string; password?: string },
): Promise<{ id: string }> {
  const email = input.email.trim().toLowerCase();
  const password =
    input.password === undefined
      ? undefined
      : await hashPassword(input.password);
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: schema.user.id })
      .from(schema.user)
      .limit(1);
    if (existing) {
      await tx
        .update(schema.user)
        .set({ email, emailVerified: true, updatedAt: new Date() })
        .where(eq(schema.user.id, existing.id));
      return existing;
    }

    const userId = randomUUID();
    await tx.insert(schema.user).values({
      id: userId,
      name: "",
      email,
      emailVerified: true,
      updatedAt: new Date(),
    });
    if (password !== undefined) {
      await tx.insert(schema.account).values({
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password,
        updatedAt: new Date(),
      });
    }
    return { id: userId };
  });
}
