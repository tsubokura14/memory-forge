import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/server/db/client";
import * as schema from "@/server/db/schema";

const DAY_SECONDS = 60 * 60 * 24;

// HTTP の入口は Google からの戻り先の1本だけを置き、ほかはサーバーの中から auth.api を呼ぶ（docs/design.md の「Better Auth の HTTP の入口は戻り先の1本だけ」）。
// 秘密の値と URL は、環境変数の BETTER_AUTH_SECRET・BETTER_AUTH_URL を Better Auth が読む
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // アカウントは画面の外（scripts/create-user.ts）で作る
    disableSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // 紐づけていない Google アカウントで、新しいアカウントを作らない
      disableSignUp: true,
    },
  },
  account: {
    accountLinking: {
      // 自分の Google アカウントを Login で自動で紐づける（docs/design.md の「データ」の「ログイン」）。
      // Better Auth が自動で紐づけるのは、メールアドレスが user.email と同じで、user.email_verified が true で、Google が確かめ済みのときだけ
      disableImplicitLinking: false,
      // 自分の別の Google アカウント（メールアドレスが違う）も紐づけられるようにする
      allowDifferentEmails: true,
    },
  },
  session: {
    // 「最後に使ってから30日」。使うたびに延ばすと、画面を開くたび（先読みでも）DB に書き込むので、
    // 前に延ばしてから1日たっていたら延ばす。そのため、切れるのは最後に使ってから29〜30日と、最大で約1日早くなる
    expiresIn: DAY_SECONDS * 30,
    updateAge: DAY_SECONDS,
    // unlink（unlinkAccount）は、既定ではログインしてから1日たったセッションを断る。30日ログインしたままと合わないので外す。
    // 前提（崩れたら見直す）：この制限がかかる機能（パスワードの変更など）を画面から使っていない
    freshAge: 0,
  },
  // サーバーアクションから呼んだとき、Better Auth が作った cookie を返事に付ける。plugins の最後に置く
  plugins: [nextCookies()],
});
