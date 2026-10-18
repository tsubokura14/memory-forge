import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/server/db/client";
import * as schema from "@/server/db/schema";

const DAY_SECONDS = 60 * 60 * 24;

// HTTP の入口（/api/auth/[...all]）は置かず、サーバーの中から auth.api を呼ぶ（docs/design.md の「Better Auth の HTTP の入口を置かない」）。
// 秘密の値と URL は、環境変数の BETTER_AUTH_SECRET・BETTER_AUTH_URL を Better Auth が読む
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // アカウントは画面の外（scripts/create-user.ts）で作る
    disableSignUp: true,
  },
  session: {
    // 「最後に使ってから30日」。使うたびに延ばすと、画面を開くたび（先読みでも）DB に書き込むので、
    // 前に延ばしてから1日たっていたら延ばす。そのため、切れるのは最後に使ってから29〜30日と、最大で約1日早くなる
    expiresIn: DAY_SECONDS * 30,
    updateAge: DAY_SECONDS,
  },
  // サーバーアクションから呼んだとき、Better Auth が作った cookie を返事に付ける。plugins の最後に置く
  plugins: [nextCookies()],
});
