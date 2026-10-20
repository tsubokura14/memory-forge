// アカウントの行を入れる関数。scripts/create-user.ts と、テスト（Vitest・Playwright の global setup）から使う。
// Playwright は package.json に "type": "module" がないとファイルを CommonJS として読み、
// import.meta を使うファイル（create-user.ts）を読み込めないので、ここに分けている
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../src/server/db/schema.ts";

// Better Auth の sign up と同じ形で、user と、パスワードのハッシュを持つ account（credential）の行を入れる
export async function createUser(
  db: NodePgDatabase<typeof schema>,
  input: { email: string; password: string },
) {
  const email = input.email.trim().toLowerCase();
  const password = await hashPassword(input.password);
  await db.transaction(async (tx) => {
    const userId = randomUUID();
    await tx.insert(schema.user).values({
      id: userId,
      name: "",
      email,
      emailVerified: false,
      updatedAt: new Date(),
    });
    await tx.insert(schema.account).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password,
      updatedAt: new Date(),
    });
  });
}
