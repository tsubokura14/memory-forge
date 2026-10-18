# Drizzle ORM・drizzle-kit

書いた時点のバージョン：drizzle-orm 0.45.4、drizzle-kit 0.31.11

## 簡単な説明

TypeScript で表を定義し、SQL に近い書き方でデータベースを読み書きする道具（drizzle-orm）。表の定義から、形の変更（マイグレーション）の SQL を作り、データベースに当てる道具が drizzle-kit。

- 公式：https://orm.drizzle.team/docs/overview
- PostgreSQL（node-postgres）での使い方：https://orm.drizzle.team/docs/get-started-postgresql
- drizzle-kit の設定：https://orm.drizzle.team/docs/drizzle-config-file

## このプロジェクトで使っている部分

- `src/server/db/schema.ts`：表の定義
- `src/server/db/client.ts`：`drizzle-orm/node-postgres` で、`pg` の接続プールから `db` を作る
- `drizzle.config.ts`：drizzle-kit の設定。形の変更のファイルは `drizzle/` に作られる
- `npm run db:generate`（`drizzle-kit generate`）：表の定義と前回のファイルを比べ、形の変更の SQL を `drizzle/` に作る
- `npm run db:migrate`（`drizzle-kit migrate`）：`drizzle/` のまだ当てていない SQL を当てる。当てた記録は、データベースの `drizzle` スキーマの表に残る
