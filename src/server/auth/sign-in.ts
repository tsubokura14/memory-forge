import { APIError } from "better-auth/api";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { signInAttempts } from "@/server/db/schema";
import { auth } from "./auth";
import { isLocked, lockedUntilFrom, MAX_FAILURES } from "./lockout";

export type SignInResult = "ok" | "incorrect" | "locked";

// Better Auth が「違う」として返すもの。ほかのエラー（DB につながらないなど）は、そのまま投げる
const INCORRECT_CODES = new Set([
  "INVALID_EMAIL_OR_PASSWORD",
  "INVALID_EMAIL",
  "PASSWORD_TOO_LONG",
]);

// 続けて間違えた回数は、入れたメールアドレスごとに数える。IP ごとだと IP を変えれば何度でも試せ、
// アプリ全体で1つだと他人が登録されていないメールアドレスで間違えても自分が止まるため。
// 登録されていないメールアドレスも同じに数え、止めたときの返事も同じにする（登録されているかを見分けられないように）
export async function signIn(
  input: { email: string; password: string },
  now: Date = new Date(),
): Promise<SignInResult> {
  const email = input.email.trim().toLowerCase();

  const [attempts] = await db
    .select({ lockedUntil: signInAttempts.lockedUntil })
    .from(signInAttempts)
    .where(eq(signInAttempts.email, email));
  // 止めている間は確かめずに返す。回数も期限も変えないので、止めている間に試しても15分は延びない
  if (isLocked(attempts?.lockedUntil ?? null, now)) return "locked";

  try {
    await auth.api.signInEmail({ body: { email, password: input.password } });
  } catch (error) {
    if (
      error instanceof APIError &&
      INCORRECT_CODES.has(error.body?.code ?? "")
    ) {
      const lockedUntil = await recordFailure(email, now);
      return isLocked(lockedUntil, now) ? "locked" : "incorrect";
    }
    throw error;
  }

  await db.delete(signInAttempts).where(eq(signInAttempts.email, email));
  return "ok";
}

// 回数を足し、MAX_FAILURES 回目なら期限を入れる。同時に送られても数え漏れないよう、1つの SQL で行う。
// 期限が過ぎた行は、回数を0とみなして1から数え直す
async function recordFailure(email: string, now: Date): Promise<Date | null> {
  const nowParam = sql`${now.toISOString()}::timestamptz`;
  const failedCount = sql`case
    when ${signInAttempts.lockedUntil} <= ${nowParam} then 1
    else ${signInAttempts.failedCount} + 1
  end`;
  const [row] = await db
    .insert(signInAttempts)
    .values({ email, failedCount: 1, lockedUntil: null })
    .onConflictDoUpdate({
      target: signInAttempts.email,
      set: {
        failedCount,
        lockedUntil: sql`case
          when ${failedCount} >= ${MAX_FAILURES}
            then ${lockedUntilFrom(now).toISOString()}::timestamptz
          else null
        end`,
      },
    })
    .returning({ lockedUntil: signInAttempts.lockedUntil });
  return row.lockedUntil;
}
