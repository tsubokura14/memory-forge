// アカウントの行を入れる関数。scripts/create-user.ts と、テスト（Vitest・Playwright の global setup）から使う。
// Playwright は package.json に "type": "module" がないとファイルを CommonJS として読み、
// import.meta を使うファイル（create-user.ts）を読み込めないので、ここに分けている
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../src/server/db/schema.ts";

// アカウント（user の行）を1つにそろえる。なければ作り、あれば email と email_verified を合わせる（docs/design.md の「データ」の「ログイン」）。
export async function createUser(
  db: NodePgDatabase<typeof schema>,
  input: { email: string },
): Promise<{ id: string }> {
  const email = input.email.trim().toLowerCase();
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
    return { id: userId };
  });
}
