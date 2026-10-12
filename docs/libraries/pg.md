# pg（node-postgres）

書いた時点のバージョン：pg 8.23.1、@types/pg 8.23.1

## 簡単な説明

Node.js から PostgreSQL に TCP でつなぐドライバー。`Pool` は接続をいくつか開いたまま持っておき、使い回す（接続プール）。

- 公式：https://node-postgres.com/
- Pool：https://node-postgres.com/apis/pool

## このプロジェクトで使っている部分

- `src/server/db/client.ts` で `new Pool({ connectionString })` を1つ作り、Drizzle に渡す。直接 SQL は書かない
