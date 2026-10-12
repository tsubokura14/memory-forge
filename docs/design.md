<!--
今の設計。アプリが今どう作られているかのうち、複数の場所に関わるものを、理由と前提つきで書く。
全体の整合性は、ソースコード全体ではなくこのファイルで確かめる。

- 1か所だけに関わる理由は、コードのコメントに書く。ここには書かない（同じ理由を2か所に書かない）
- 迷ったら「この前提が崩れたら、直すのは1か所だけか？」。1か所ならコメント、複数ならここ
- 「今どう作られているか」を現在形で書く。比べた選択肢などの経緯は書かない（docs/changes/ に残っている）
- 機能を仕上げるとき（/dev-finish）に docs/changes/ の「設計」から反映する。決まりができたタスクPRで書き足してもよい
- 見た目の決まり（色や部品の使い分け）は docs/ui.md に書く
- 長くなったら docs/design/ に分ける
-->

# 今の設計

## 全体の構成

```
src/
  app/          画面とルート（App Router）。データを取ってきて部品に渡すだけにする
  components/   画面の部品（docs/ui.md の部品）
  server/       サーバーだけで動く処理
    db/         接続（client.ts）と表の定義（schema.ts）
    <機能>/     機能ごとの読み書きと決まり（例：server/import/）。計算は、データベースを使わない関数に分ける
  styles/
    tokens.css  トークン（色・余白・文字の値はここにだけ書く）
    globals.css Tailwind の読み込みと、トークンの登録
  **/*.test.ts  Vitest のテスト。確かめるファイルの横に置く
drizzle/        形の変更（マイグレーション）のファイル。drizzle-kit が作る
e2e/            Playwright のテスト（*.spec.ts）。画像を比べるテストもここ
docs/specs/screens/  基準の画像（<画面>-<状態>.png）
scripts/        npm のコマンドとフックから呼ぶ Node.js のスクリプト
```

- 決まり（入力の確かめ、出し分け、計算）は `src/server/` に置き、画面（`src/app/`、`src/components/`）には書かない
  - 理由：1つの決まりを、いちばん中心の層で1回だけ Vitest で確かめるため（`docs/process/testing.md`）。画面のテストは、結果がどの文言で出るかだけにできる
  - 前提（崩れたら見直す）：決まりを使うのはこのアプリの画面だけ。あとで作る「問題を取り出す API」も `src/server/` を呼ぶ
- データベースに触るのは `src/server/` だけ。画面の部品から直接 `db` を読まない

## データベースのつながり方

| 使う場所 | Neon のブランチ | 接続先の置き場所 |
| --- | --- | --- |
| 本番（Vercel の Production） | main（Neon のいちばん上のブランチ） | Neon の Vercel 連携が入れる |
| 確かめ用の公開（Vercel の Preview） | `preview/<Git のブランチ名>`（Vercel 連携が公開ごとに作る） | Vercel 連携がその公開だけに入れる |
| 手元の開発（`npm run dev`） | `dev` | `.env.local` |
| 手元のテスト（Vitest、Playwright、画面を撮る） | `test` | `.env.test` |
| CI | `ci` | GitHub の Secret `DATABASE_URL` |

- `dev`・`test`・`ci` は、Neon の画面で main から作ったブランチ。テストは自分で入れたデータだけを使い、始める前に表を空にする（main から写した本番のデータを当てにしない）
- 接続は `pg` の接続プールと `drizzle-orm/node-postgres`（`src/server/db/client.ts`）
  - 理由：取り込みで、途中で読んで判断するトランザクションを使うため。手元・CI・本番が同じ書き方になる
- 形の変更を当てる場所
  - 手元：`npm run db:generate` でファイルを作り、`npm run db:migrate` で `dev`・`test` に当てる
  - CI：テストの前に `ci` に当てる（`.github/workflows/ci.yml`）
  - 本番と確かめ用の公開：Vercel のビルドの最初に当てる（`vercel.json` の `buildCommand`）。接続プールを通さない `DATABASE_URL_UNPOOLED` を使う（`drizzle.config.ts`）。当て方の決まりは「どこでも守る決まり」の「データベースの形の変更は「足す」ものにする」
- 秘密の値は `.env.local`・`.env.test`（Git に入らない）、GitHub の Secret、Vercel にだけ置く。`.env.example` に名前だけを書く

## 画面の画像を撮る・比べる仕組み

- 撮る・比べるは、Playwright 公式の Docker イメージ（`mcr.microsoft.com/playwright:v<入れた @playwright/test の版>-noble`）の中で、アプリのビルドと立ち上げも含めて行う。同じイメージにする理由は `docs/process/screenshots.md`
  - 手元：`npm run screens:test`・`npm run screens:update -- <画面のテストのファイル>`（`scripts/screens.mjs` が `docker run` する）
  - CI：`screens` のジョブの `container:` に同じイメージを指定する
  - 前提（崩れたら見直す）：イメージの版は、入れた `@playwright/test` の版から決めている（`scripts/screens.mjs` と `ci.yml`）。違うと、イメージの中のブラウザと合わない
- Playwright の `webServer` で `next build` と `next start` をし、`test`（CI では `ci`）のデータベースにつなぐ（`playwright.config.ts`）
- 基準の画像は `docs/specs/screens/<画面>-<状態>.png`（OS 名を入れない）
- 撮るたびに変わるものを止める
  - 日時：ブラウザの日時を `page.clock` で固定する（`e2e/fixtures.ts`）。画像を撮るテストは、ここの `test` を使う
  - 書体：`next/font` でアプリから配り（`src/app/layout.tsx`）、イメージに入っている書体に頼らない
  - アニメーション：`toHaveScreenshot` の既定で止まる
  - 前提（崩れたら見直す）：サーバー側の日時は固定していない。サーバーで日付を使う画面（連続日数など）を撮るときは、固定する方法を足す
- 状態（0件など）は、テストの前に `test` のデータベースに決まったデータを入れて作る（`docs/process/screenshots.md`）

## データ

<!-- 保存するものの持ち方（テーブルなど）と、その理由・前提 -->

## どこでも守る決まり

<!--
複数のファイルで守る決まり。命名、エラーの扱い、コードの書き方を縛るライブラリの注意など。
1つの決まりを、次の形で書く。例：

### データベースの1回の操作は1つのSQLにする
- 理由：この接続方法ではトランザクションが使えない
- 前提（崩れたら見直す）：接続方法を変えたら、この決まりは要らなくなる
- 当てはまる場所：src/db/ のすべての関数
-->

### データを読む部品は `<Suspense>` で囲む

- 理由：Cache Components を有効にしている（`next.config.ts`）。画面のうち変わらない部分を先に出し、データを読む部分はあとから流し込むので、囲まないとビルドが失敗する。囲んだ `fallback` が、`docs/ui.md` の「読み込み中」の見た目になる
- 前提（崩れたら見直す）：Cache Components をやめたら、この決まりは要らなくなる
- 当てはまる場所：`src/app/` と `src/components/` の、データを読むすべての部品

### データベースの形の変更は「足す」ものにする

- 理由：本番と確かめ用の公開では、Vercel のビルドの最初に形の変更を当てる（`vercel.json` の `buildCommand`）。本番では、形を変えたあと、公開が切り替わるまで前の版のコードが動く。前の版のコードが読む列や表を消したり名前を変えたりすると、その間に前の版が壊れる
- 前提（崩れたら見直す）：形の変更を、ビルドの中（公開の前）で当てている。消すとき・名前を変えるときは、使わなくするPRと消すPRの2回に分ける
- 当てはまる場所：`src/server/db/schema.ts` と `drizzle/` のすべての変更

### トークンにない値は、ESLint で止める

- 理由：`docs/ui.md` の「トークンにない値を使わない」を、人の目に頼らずに守るため。`src/styles/tokens.css` の先頭で Tailwind の既定の色・文字などを `initial` で消しているので、トークンにない色や文字の大きさのクラスは `no-unknown-classes` で止まる。`p-[13px]` のような書いた値は Tailwind では正しいクラスなので、`[` を含むクラスを `no-restricted-classes` で止める（`eslint.config.mjs`）
- 前提（崩れたら見直す）：`tokens.css` の先頭の `--color-*: initial` などの行がある。プロトタイプから写し直してこの行が消えると、Lint は何も言わずに止めなくなる。止めるのは `className` の中だけで、`style` や CSS ファイルに書いた値は止まらない
- 当てはまる場所：`src/` のすべての `.ts`・`.tsx`
