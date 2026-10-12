# @vercel/functions

書いた時点のバージョン：@vercel/functions 3.9.11

## 簡単な説明

Vercel の上で動くサーバーの処理から、Vercel の仕組みを使うための小さな関数の集まり。

- 公式：https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package

## このプロジェクトで使っている部分

- `attachDatabasePool`：接続プールを渡すと、使い終わった接続が片付くまで関数を止めずに待つ。Vercel は同じ関数を続けて使い回す（Fluid compute）ので、接続を開いたまま止まって、データベースの接続が残り続けるのを防ぐ。`src/server/db/client.ts` で、Vercel の上で動くときだけ呼ぶ
- 参考：https://neon.com/docs/guides/vercel-connection-methods
