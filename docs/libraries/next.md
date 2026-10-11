# Next.js

書いた時点のバージョン：next 16.4.0（react 19.3.0）

## 簡単な説明

React で画面を作り、同じプロジェクトにサーバーの処理も書けるフレームワーク。このプロジェクトでは App Router（`src/app/` のフォルダの形が、そのまま URL になる作り）を使う。

- 公式：https://nextjs.org/docs
- インストールした版のドキュメント：`node_modules/next/dist/docs/`

## このプロジェクトで使っている部分

- `src/app/layout.tsx`：すべての画面に共通する外側（`<html>` と `<body>`）
- `src/app/page.tsx`：`/` の画面
- Server Components：`src/app/` の部品は、特に書かなければサーバーで組み立てられる。ブラウザで動かす部品だけ、ファイルの先頭に `"use client"` を書く
- Cache Components（`next.config.ts` の `cacheComponents: true`）：画面のうち変わらない部分を先に出し、データを読む部分はあとから流し込む。データを読む部分は `<Suspense>` で囲み、囲んだ部品の読み込み中の見た目を `fallback` に書く
- `next.config.ts` の `agentRules: false`：`next dev` が `AGENTS.md` を作らないようにしている
- 型：`LayoutProps` や `PageProps` は、`next typegen`（`npm run typecheck` の中で動く）が作る型
