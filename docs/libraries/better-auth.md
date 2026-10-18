# Better Auth

書いた時点のバージョン：better-auth 1.7.10

## 簡単な説明

TypeScript のログインの仕組み。パスワードのハッシュ、DB に持つセッション、cookie を受け持つ。Google でのログインやパスワードの再設定も、設定とプラグインで足せる。

- 公式：https://www.better-auth.com/docs
- メールアドレスとパスワード：https://www.better-auth.com/docs/authentication/email-password
- セッション：https://www.better-auth.com/docs/concepts/session-management
- Drizzle の adapter：https://www.better-auth.com/docs/adapters/drizzle
- Next.js との組み合わせ：https://www.better-auth.com/docs/integrations/next

## このプロジェクトで使っている部分

- `src/server/auth/auth.ts`：設定（`betterAuth()`）
  - `emailAndPassword`：メールアドレスとパスワードで入る。`disableSignUp` で新しい登録を止める。パスワードは既定の scrypt でハッシュにする
  - `session.expiresIn`・`session.updateAge`：セッションの長さと、期限を延ばす間隔（秒）
  - `drizzleAdapter`：表は `src/server/db/schema.ts` の `user`・`session`・`account`・`verification`。定義は CLI（`npx auth generate`）で作る
  - `nextCookies()`：サーバーアクションから呼んだとき、Better Auth が作った cookie を返事に付けるプラグイン。`plugins` の最後に置く
- `auth.api.signInEmail()`・`auth.api.getSession()`・`auth.api.signOut()`：サーバーの中から直接呼ぶ。HTTP の入口（`toNextJsHandler`）は置かない
  - 間違えたときは `APIError`（`better-auth/api`）を投げる。どの間違いかは `error.body.code`（例：`INVALID_EMAIL_OR_PASSWORD`）
- `hashPassword`（`better-auth/crypto`）：Better Auth と同じハッシュを作る。`scripts/create-user.ts` で使う
- 環境変数：`BETTER_AUTH_SECRET`（cookie の署名）と `BETTER_AUTH_URL`（アプリの URL）を、Better Auth が自分で読む。テストの中（`NODE_ENV=test`）では、`BETTER_AUTH_SECRET` がなくてもテスト用の値で動く
