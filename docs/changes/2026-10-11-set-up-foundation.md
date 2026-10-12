<!--
変更の仕様のひな形。コピーして docs/changes/<年-月-日>-<何をするか>.md を作る（例：2026-09-17-add-due-date.md）。
「なぜ」〜「調べたこと」は、AIが下書きし、人間が答えて決める（手順5）。「画面」のスクリーンショットは、プロトタイプで合意したときに足す（手順6）。
「設計」以降はAIが下書きし、人間がレビューする（手順7）。
スクリーンショットは、このファイルと同じ名前のフォルダに置く（例：2026-09-17-add-due-date/list-empty.png）。
-->

# 開発を始められる（#17）

## なぜ

目的・機能・画面の雰囲気は決まったが、アプリのコードがまだ1行もない。技術が決まっておらず、テストを実行する手段もないので、「テストを先に書き、失敗を確かめてから実装する」進め方で機能を作り始められない。
また、画面の見た目がずれたこと・テストが落ちたことに、人の目だけで気づく状態では、AIに実装を任せられない。そこで、機能を作り始める前に、技術を決め、テスト・画面の画像の比べ・PR ごとの自動チェックが動く土台を作る（進め方は `docs/process/foundation.md`）。

## 影響する今の仕様

- `docs/specs/` に書く動きはない（アプリの機能は増えない）
- 仕上げで書き足すもの：`docs/overview.md` の「技術」、`docs/design.md` の「全体の構成」、`docs/ui.md` の「トークン」のファイルの場所、`CLAUDE.md` の「技術」「よく使うコマンド」、`README.md`

## 使う場面

1. AIが新しい機能のタスクに入るとき、受け入れ条件のテストを1つ書いてコマンドで実行すると、まだ作っていないので失敗と出る。実装したあと、同じコマンドで成功と出る
2. AIがボタンの余白を変えるつもりのない変更をしたのに、Home の見た目が変わった。PR を出すと、自動のチェックで画像の比べが失敗と PR に出る。人間は、PR から基準の画像・今回の画像・差分の画像を開いて、どこが変わったかを見る
3. AIがファイルを1つ編集すると、そのファイルだけが自動で整形される。ほかのファイルは変わらない

## 受け入れ条件

- 開発する人が、手元でアプリを立ち上げ、ブラウザで開ける
- 手元で、コマンド1つでテストを実行でき、成功・失敗が出る。テストを1つだけ選んで実行することもできる
- 手元で、コマンドで Lint と型チェックを実行できる
- 色・余白・文字の値を書いたファイルが本番のコードの中に1つあり、画面はその値を使う。その場所が `docs/ui.md` に書いてある
- 手元で、コマンド1つで本番の画面を撮り直せる。撮った画像は `docs/specs/screens/` に `<画面>-<状態>.png` の名前で入る
  - 手元の OS（Windows）で撮っても、自動のチェックで撮ったのと同じ画像になる
  - 撮るたびに変わるもの（今日の日付、アニメーション）で画像が変わらない
- 手元で、コマンド1つで画面の画像を基準の画像と比べられ、違えば失敗と出る
- PR を出す（更新する）と、テスト・Lint・型チェック・画像の比べが自動で走り、結果が PR に出る
  - 画像の比べが失敗したら、基準・今回・差分の画像を PR から開ける
  - 自動のチェックでは基準の画像を更新しない
- AIがファイルを編集すると、そのファイルだけが整形・Lint される。対象でない種類のファイル（`.md`、画像など）では何もしない。整形や Lint が失敗しても、AIの作業は止まらない。Windows で動く
- 開発用・テスト用・本番のデータベースが分かれていて、それぞれにアプリからつながる。テストで本番のデータが変わらない
- main にマージすると、本番に自動で公開される。公開したアプリを、ブラウザで開ける
- PR を出す（更新する）と、その PR の中身が確かめ用の URL に公開され、URL が PR に出る。PC でもスマホでも開ける。確かめ用の公開は、本番のデータベースにつながらない
- 秘密の値（データベースの接続先など）は、リポジトリに入らない
- main のブランチ保護で、自動のチェックが通らないとマージできない
- 使う技術と選んだ理由が `docs/overview.md` に、よく使うコマンドが `CLAUDE.md` に書いてあり、`test-runner` がそのコマンドでテストを実行できる
- `README.md` を読むと、GitHub で見た人が、何のアプリで、どう立ち上げるかがわかる

## 画面

機能の画面は作らない（プロトタイプは作らない）。撮る仕組みを確かめるために、仮の最初の画面を1つだけ置く。

### 仮の最初の画面

| 状態 | 表示 |
| --- | --- |
| 通常 | アプリ名だけ。色と文字は、本番のトークンファイルの値を使う |

- 撮る仕組みで撮り、`docs/specs/screens/` に入る最初の1枚にする
- Home などの機能の画面を作るときに置き換える

## やらないこと

- アプリの機能（ログイン、取り込み、解くなど）は作らない。立ち上げて開ける最初の画面だけ
- データベースの表（テーブル）は作らない。つながることだけを確かめる
- 複数のタスクを別のフォルダで同時に進めるための仕組み（フォルダごとにポートを変えるなど）は作らない。このプロジェクトは1つのフォルダで順に進める
- リポジトリの公開と、main のブランチ保護の設定は AI がしない（人間が行う）

## 決まっていないこと

<!-- 答えは人間が書く。答えも消さずに残す。例：- [x] 完了したタスクも赤字にする？ → しない -->

- [x] 撮る仕組みを確かめるための、仮の最初の画面を作る？ → 作る
- [x] 本番に公開する流れ（自動デプロイ）も作る？ → 作る
- [x] PR ごとに、確かめ用の公開（プレビュー）も作る？ → 作る
- [x] データベースは、アプリからつながるところまでやる？ → やる。どのサービスにするか（Neon か Firebase で迷っている）は、`/dev-plan` で候補を比べて決める
- [x] 画面を撮る環境（Docker Desktop）はある？ → ある（起動している）
- [x] 複数のタスクを別のフォルダで同時に進める？ → 進めない。1つのフォルダで順に進める
- [x] main のブランチ保護で CI を必須にできる？ → 無料のプランだが、リポジトリを公開してよいので、公開して設定する
- [x] `tokens.css` は書体を名前（`"Geist"` など）で書いているが、`next/font` は読み込んだ書体に別の名前を付けるのでつながらない。どうつなぐ？ → AIのおすすめどおり、`tokens.css` の `--font-*` を `next/font` の CSS 変数を指す形に変える（タスク4）
- [x] `tokens.css` に余白の値がない。Tailwind の既定の余白（`p-4` など）をトークンとみなす？ → AIのおすすめどおり、みなす
- [x] 仮の画面のアプリ名は？ → AIのおすすめどおり、「memory-forge」を mono で出す
- [x] `tokens.css` の先頭のコメントがプロトタイプ向けの文のまま（写す向きが逆に読める）。どうする？ → AIのおすすめどおり、本番向けの文に直す（タスク4）

## 調べたこと

- 2026-10 時点の最新版：next 16.4.0、react 19.3.0、drizzle-orm 0.45.4、drizzle-kit 0.31.11、pg 8.23.1、vitest 5.0.3、@playwright/test 1.64.0、tailwindcss 4.3.3、eslint 10.12.0、eslint-config-next 16.4.0、prettier 3.9.10。手元は Node.js 24.13.0、npm 11.12.1、Docker 28.4.0。入れるときの版は、各タスクで入れた版を正とする
- Next.js 16 では `next lint` がなくなり、ESLint の CLI と `eslint.config.mjs`（flat config）で動かす。Prettier と組むときは `eslint-config-prettier/flat` を足す。`eslint-config-next` は ESLint 9 と 10 に対応するが、中の一部のプラグインが 10 を peer に書いておらず、警告が出ることがある（https://nextjs.org/docs/app/api-reference/config/eslint）
- Neon は、Vercel の Fluid compute では `pg`（TCP）の接続プールと `@vercel/functions` の `attachDatabasePool` を勧めている。Drizzle では `drizzle-orm/node-postgres` で使う（https://neon.com/docs/guides/vercel-connection-methods）。HTTP のドライバー（`@neondatabase/serverless`）は、途中で読んで判断するトランザクションに向かない
- Neon の Vercel 連携は、Vercel の確かめ用の公開（Preview）ごとに `preview/<Git のブランチ名>` の Neon のブランチを作り、その公開だけに `DATABASE_URL`（プール経由）と `DATABASE_URL_UNPOOLED`（直接）を渡す。ブランチは Vercel の公開が消えるときに消える（既定の保存期間は6か月）（https://neon.com/docs/guides/vercel-managed-integration）。実際には Neon の画面からつないだ（「人間がすること」）。`preview/<Git のブランチ名>` ができることは確かめたが、ブランチが自動で消えるかは確かめていない
- Playwright は `snapshotPathTemplate`（`{arg}`、`{ext}`、`{platform}` など）で基準の画像の場所と名前を変えられる。`webServer` でテストの前にサーバーを立ち上げる。`toHaveScreenshot` はアニメーションを既定で止める（https://playwright.dev/docs/api/class-testconfig）
- Tailwind のクラスを ESLint で調べるプラグイン `eslint-plugin-better-tailwindcss` は Tailwind 4 と flat config に対応し、`no-unknown-classes`・`no-restricted-classes` を持つ。トークンにない値（`p-[13px]`）を止められるかは、トークンのタスクで確かめる

---

## 設計

### 選んだ技術

| 用途 | 使うもの | 選んだ理由 | 比べた候補と選ばなかった理由 |
| --- | --- | --- | --- |
| 言語・フレームワーク | Next.js（App Router、TypeScript） | 画面とサーバーの処理を1つに書ける。情報が多く、AIの実装が安定する。Vercel と相性が良い | SvelteKit：情報・部品が少ない。React + Vite：サーバーの処理（取り込みの確かめ、集計）を別に作る必要がある |
| データベース | Neon（PostgreSQL） | このアプリの中心は、記録の集計（正答率、低い順、最後の答えで数える身についている具合、連続日数）と、50問ずつのページ。どれも SQL で素直に書ける。取り込みを1つのトランザクションで「全部か、何もしないか」にできる。Vercel 連携で、確かめ用の公開ごとに別のデータベースができる | Firebase（Firestore）：ログインが揃っているのは大きな利点。だが、集計と計算した値での並べ替え・ページ番号での移動が苦手で、答えるたびに集計用の値を書き足し続ける作りになり、ずれたときに気づきにくい。データの量はどちらにも小さく、速さの差は決め手にならない |
| データベースの読み書き | Drizzle ORM（drizzle-kit で形の変更を管理） | SQL に近い書き方で集計を書ける。型が TypeScript だけで決まり、生成の手順が要らない | Prisma：集計は結局 SQL を直接書きがちで、型の生成が要る。SQL を直接：型と形の変更の管理を自分で用意する |
| テスト | Vitest（中の決まり）、Playwright（画面を通したテストと画像の比べ） | Vitest は TypeScript をそのまま速く動かし、1つだけ選んで実行しやすい | Jest：TypeScript を動かす設定が要り、遅い。Playwright だけ：小さな決まりも画面を通すことになり、遅く、失敗の場所がわかりにくい |
| 整形・Lint | Prettier、ESLint（`eslint-config-next`） | Next.js の公式のルールと、Tailwind のクラスを調べるルールが使える | Biome：速いが、Next.js の公式のルールの一部が使えない |
| 見た目 | Tailwind CSS 4 | トークンを Tailwind の値として登録し、部品にそのまま書ける。トークンにない値を Lint で見つけやすい | CSS Modules：トークンにない値を見つけるのに Stylelint が別に要り、ファイルが増える |
| デプロイ先 | Vercel（Neon の Vercel 連携） | GitHub につなぐだけで、main は本番に、PR は確かめ用の URL に自動で公開され、URL が PR に出る | Cloudflare：Next.js を動かすのに変換の道具が要り、使えない機能がある。Firebase Hosting：PR ごとの公開を自分で CI に組み込む必要があり、サーバーの処理に有料のプランが要る |
| Next.js の Cache Components | 有効（create-next-app 16.4 の既定） | Next.js のこれからの既定で、公式のドキュメントもこの前提になる。データを読む部分を Suspense で囲む決まりが、`docs/ui.md` の「読み込み中」の見せ方とそのまま対応する | 無効：情報が多く決まりが少ないが、これからの既定から外れ、あとで有効にすると、データを読む画面をまとめて書き直すことになる |
| パッケージの管理 | npm | `.claude/settings.json` の許可が npm のコマンドで書かれている | — |

### 全体の構成（仕上げで `docs/design.md` の「全体の構成」に移す）

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

### データベースのつながり方（仕上げで `docs/design.md` に移す）

| 使う場所 | Neon のブランチ | 接続先の置き場所 |
| --- | --- | --- |
| 本番（Vercel の Production） | main（Neon のいちばん上のブランチ） | Vercel 連携が入れる |
| 確かめ用の公開（Vercel の Preview） | `preview/<Git のブランチ名>`（Vercel 連携が自動で作る） | Vercel 連携がその公開だけに入れる |
| 手元の開発（`npm run dev`） | `dev` | `.env.local` |
| 手元のテスト（Vitest、Playwright、画面を撮る） | `test` | `.env.test` |
| CI | `ci` | GitHub の Secret `DATABASE_URL` |

- `dev`・`test`・`ci` は、人間が Neon の画面で main から作る。テストは自分で入れたデータだけを使い、始める前に表を空にする（main から写した本番のデータを当てにしない）
- 接続は `pg` の接続プールと `drizzle-orm/node-postgres`。本番では `attachDatabasePool` を付ける
  - 理由：取り込みで、途中で読んで判断するトランザクションを使うため。手元・CI・本番が同じ書き方になる
- CI のワークフローに `concurrency` を付け、同じ PR の古い実行を止める。`ci` のブランチを2つの実行が同時に使わないようにするため
- 形の変更：手元は `npm run db:generate` でファイルを作り、`npm run db:migrate` で `dev`・`test` に当てる。CI はテストの前に `ci` に当てる。本番と確かめ用の公開は、Vercel のビルドの最初に当てる（`DATABASE_URL_UNPOOLED` を使う）
  - 前提（崩れたら見直す）：形の変更は、前の版のコードでも動くように「足す」ものにする（本番では、ビルドで形を変えたあと、公開が切り替わるまで前の版のコードが動くため）。消すときは2回の PR に分ける。この決まりは `docs/design.md` の「どこでも守る決まり」に書く
  - Vercel 連携の接続先が、ビルドのときに読めるかは、デプロイのタスクで確かめる。読めなければ、本番は CI で main にマージしたあとに当てるやり方に変え、ここを直す
- 秘密の値は `.env.local`・`.env.test`（`.gitignore` 済み）、GitHub の Secret、Vercel にだけ置く。`.env.example` に名前だけを書く

### 本番の画面を撮る仕組み（仕上げで `docs/design.md` に移す）

- 撮る・比べるは、Playwright 公式の Docker イメージ（`mcr.microsoft.com/playwright:v<入れた版>-noble`）の中で、アプリのビルドと立ち上げも含めて行う
  - 手元：`scripts/screens.mjs` が `docker run` でリポジトリをイメージにつなぎ、中で `npm ci` → テストを動かす。`node_modules` は Docker の名前付きボリュームに置く（Windows の `node_modules` には Windows 用のファイルが入っていて、Linux では動かないため）。npm のスクリプトから Node.js で呼ぶので、Windows でも同じコマンドで動く
  - CI：ジョブの `container:` に同じイメージを指定する
- Playwright の `webServer` で `next build` と `next start` をして、`.env.test` の接続先を渡す。手元でもコンテナの中なので、別のフォルダのサーバーを撮ることはない
- 基準の画像は `snapshotPathTemplate` で `docs/specs/screens/{arg}{ext}` にする（OS 名を入れない）
- 撮るたびに変わるもの：日時は Playwright の `page.clock` で固定する。アニメーションは `toHaveScreenshot` の既定で止まる。書体は `next/font` でアプリから配り、イメージに入っている書体に頼らない。`next/font` は書体に別の名前を付けるので、`tokens.css` の `--font-*` は書体名ではなく `next/font` の CSS 変数を指す形に変える（あわせて、`tokens.css` の先頭のコメントを本番向けの文に直す）
- 状態の作り方：この作りは、サーバー側で画面を組み立てる。状態（0件など）は、テストの前に `test` のデータベースに決まったデータを入れて作る（`docs/process/screenshots.md`）
- 撮り直すコマンドは `npm run screens:update -- <画面のテストのファイル>` のように、撮る画面を絞って指定する

### 本番のトークンファイル

- 場所：`src/styles/tokens.css`。`docs/ui.md` の「トークン」に書く
- プロトタイプは作業ディレクトリの外にあり、AIは読まない（`docs/process/prototype.md`）。そのため、**人間がプロトタイプの `tokens.css` をこの場所に写す**。AIは、写したファイルを Tailwind に登録する（中身の値は変えない）
- トークンにない値（`p-[13px]`、`#3366ff` など）を、ESLint で止める。`eslint-plugin-better-tailwindcss` で止められなければ、`className` の中の `[` を止めるルールを ESLint の設定に書く

### 仮の最初の画面

- `src/app/page.tsx`（`/`）にアプリ名だけを出す。撮る画像は `docs/specs/screens/home-default.png`（`/` には Home を作るので、Home の画面を作るときに撮り直して置き換える）

### 編集したあとのフック

- `.claude/settings.json` の `PostToolUse`、matcher は `Edit|Write`。`command: "node"`、`args: ["${CLAUDE_PROJECT_DIR}/scripts/format-on-edit.mjs"]`
- `scripts/format-on-edit.mjs`：入力の `tool_input.file_path` が `.ts`・`.tsx`・`.js`・`.mjs`・`.css`・`.json` のときだけ、Prettier（`--write`）と ESLint（`--fix`）をそのファイルにかける。`node_modules` の中の JS を `node` で直接起動する（Windows では `.cmd` を shell なしで起動できないため）。失敗しても終了コードは0にする
- `.claude/rules/testing.md` の `paths:` を `src/**/*.test.ts`、`src/**/*.test.tsx`、`e2e/**` にする

### よく使うコマンド（`CLAUDE.md` に書く）

| コマンド | すること |
| --- | --- |
| `npm run dev` | 手元でアプリを立ち上げる（`dev` のデータベース） |
| `npm test`／`npm test -- <ファイル>`／`npm test -- -t <名前>` | Vitest のテストを全部／1ファイル／名前で選んで実行する |
| `npm run lint` | ESLint と Prettier の確かめ（直さない） |
| `npm run typecheck` | 型チェック |
| `npm run format` | Prettier で整形する |
| `npm run build` | 本番用にビルドする |
| `npm run db:generate`／`npm run db:migrate` | 形の変更のファイルを作る／`dev` と `test` に当てる |
| `npm run screens:test` | Docker の中で、画面の画像を基準と比べる |
| `npm run screens:update -- <ファイル>` | Docker の中で、指定した画面を撮り直す |

### 人間がすること

- プロトタイプの `tokens.css` を `src/styles/tokens.css` に写す（トークンのタスク）
- Neon のプロジェクトを作り、`dev`・`test`・`ci` のブランチを作って、接続先を `.env.local`・`.env.test`・GitHub の Secret に入れる（データベースのタスク、CI のタスク）
- リポジトリを公開し、main のブランチ保護で CI のジョブを必須にする（CI のタスクのあと）
- Vercel のプロジェクトを GitHub のリポジトリにつなぎ、Neon の画面の Integrations から、今の Neon のプロジェクト（`dev`・`test`・`ci` のブランチがあるもの）を Vercel につなぎ、Preview でブランチを作る設定を入れる（デプロイのタスク）。Vercel の Marketplace から新しく Neon を作ると、別の Neon のプロジェクトになるため、こちらにした

## 確かめ方

ひな形・設定・ライブラリの動きなので、テストは書かない（`docs/process/testing.md` の「テストを書かないもの」）。

- アプリを立ち上げ、ブラウザで開ける：触って確かめる（`npm run dev` で `/` を開く）
- テストをコマンド1つで実行でき、成功・失敗が出る。1つだけ選べる：触って確かめる（失敗するテストを一時的に書いて、失敗→成功を見る。一時的なテストはコミットしない）
- Lint と型チェックを実行できる：触って確かめる（わざと誤りを入れて失敗を見る）
- トークンのファイルが1つあり、画面がその値を使い、場所が `docs/ui.md` にある：コードを見て確かめる。トークンにない値が Lint で止まることは、触って確かめる
- 本番の画面を撮り直せ、`docs/specs/screens/home-default.png` に入る。Windows で撮っても CI と同じ画像になる。撮るたびに変わらない：触って確かめる（手元で2回撮って差分がないこと、CI の比べが通ること）
- 画像を比べられ、違えば失敗する：触って確かめる（仮の画面の文字を一時的に変えて失敗を見る）
- PR でテスト・Lint・型チェック・画像の比べが走り、結果が PR に出る。失敗したら画像を開ける。CI では基準を更新しない：触って確かめる（一時的に失敗させた PR で、アーティファクトを開く）と、コードを見て確かめる（ワークフローで、画像を比べるテストに `--update-snapshots=none` を付け、基準の画像を作らない・更新しないこと）
- 編集したファイルだけが整形・Lint される。`.md` などでは何もしない。失敗しても止まらない。Windows で動く：触って確かめる（Windows で、`.tsx` と `.md` を編集して見る）
- 開発用・テスト用・本番のデータベースが分かれ、それぞれにつながる。テストで本番のデータが変わらない：触って確かめる（`dev`・`test` は `npm run db:migrate`、`ci` は CI、本番と確かめ用はビルドの形の変更が通ること）と、コードを見て確かめる（どの設定がどのブランチを指すか）
- main にマージすると本番に公開され、開ける：触って確かめる
- PR ごとに確かめ用の URL が PR に出て、PC とスマホで開ける。本番のデータベースにつながらない：触って確かめる（Neon に `preview/<ブランチ名>` ができていること）
- 秘密の値がリポジトリに入らない：コードを見て確かめる（`git ls-files` に `.env` の類がないこと）
- ブランチ保護で、チェックが通らないとマージできない：触って確かめる（人間が設定したあと、PR のマージのボタンを見る）
- 技術と理由が `docs/overview.md` に、コマンドが `CLAUDE.md` にあり、`test-runner` が動く：触って確かめる（`test-runner` を呼ぶ）
- `README.md` で、何のアプリで、どう立ち上げるかがわかる：コードを見て確かめる

## タスク

- [x] 1. ひな形：Next.js・Vitest・ESLint・Prettier・型チェックが入り、`npm run dev`・`npm test`・`npm run lint`・`npm run typecheck` が動き、`docs/overview.md` の「技術」と `CLAUDE.md` の「技術」「よく使うコマンド」が書けたら完了
- [x] 2. トークンと仮の画面：人間が写した `tokens.css` を Tailwind に登録し、`/` にアプリ名だけの仮の画面を出し、トークンにない値が Lint で止まり、`docs/ui.md` にトークンの場所が書けたら完了
- [x] 3. データベース：Drizzle と `pg` でつなぐ設定と形の変更のコマンドができ、`dev` と `test` に `npm run db:migrate` が通ったら完了（表は作らない）
- [x] 4. 画面を撮る仕組み：Docker の中で `/` を撮って `docs/specs/screens/home-default.png` に入り、比べるテストが通り、コマンドが `CLAUDE.md` に書けたら完了
- [x] 5. CI：PR でテスト・Lint・型チェック・画像の比べが走り、失敗したら画像のレポートが残り、人間にブランチ保護の設定を伝えたら完了
- [x] 6. デプロイ：main へのマージで本番に、PR で確かめ用の URL に公開され、それぞれのビルドで形の変更が当たったら完了
- [x] 7. 編集したあとのフックと、`.claude/rules/testing.md` の `paths:` ができ、Windows で動いたら完了
- [x] 8. `README.md` が、GitHub で見た人向けに書けたら完了
