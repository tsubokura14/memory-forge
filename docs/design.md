<!--
今の設計。アプリが今どう作られているかのうち、複数の場所に関わるものを、理由と前提つきで書く。
全体の整合性は、ソースコード全体ではなくこのファイルで確かめる。

- 1か所だけに関わる理由は、コードのコメントに書く。ここには書かない（同じ理由を2か所に書かない）
- 迷ったら「この前提が崩れたら、直すのは1か所だけか？」。1か所ならコメント、複数ならここ
- 「今どう作られているか」を現在形で書く。比べた選択肢などの経緯は書かない（docs/changes/ に残っている）
- 機能を仕上げるとき（/dev-build の仕上げ）に docs/changes/ の「設計」から反映する。決まりができたタスクPRで書き足してもよい
- 見た目の決まり（色や部品の使い分け）は docs/ui.md に書く
- 長くなったら docs/design/ に分ける
-->

# 今の設計

## 全体の構成

```
src/
  app/          画面とルート（App Router）。データを取ってきて部品に渡すだけにする
    (app)/      上のバーの付く画面（Login と Subject の画面以外）。layout.tsx が上のバーを付ける
    login/      Login（上のバーの付かない画面）
    subjects/[id]/  Subject の画面。Setup・Solve・Result を、1つの画面の中で切り替える（下の「解く画面の状態」）
  components/   画面の部品（docs/ui.md の部品）
  proxy.ts      すべての画面の前で、ログインしているかを確かめる（下の「ログインの確かめ」）
  server/       サーバーだけで動く処理
    db/         接続（client.ts）と表の定義（schema.ts）
    auth/       ログインの設定（Better Auth）と決まり（移る先、紐づけた Google アカウント）
    <機能>/     機能ごとの読み書きと決まり（例：server/import/）。計算は、データベースを使わない関数に分ける
  styles/
    tokens.css  トークン（色・余白・文字の値はここにだけ書く）
    globals.css Tailwind の読み込みと、トークンの登録。kinari-md のトークンと本文の CSS も読み込む
    question-body.css  問題文・選択肢・解説の入れ物ごとに、kinari-md の本文の見た目を上書きする（下の「問題文・選択肢・解説の表示」）
  **/*.test.ts  Vitest のテスト。確かめるファイルの横に置く
drizzle/        形の変更（マイグレーション）のファイル。drizzle-kit が作る
e2e/            Playwright のテスト（*.spec.ts）。画像を比べるテストもここ
docs/specs/screens/  基準の画像（<画面>-<状態>.png）
scripts/        npm のコマンドとフックから呼ぶ Node.js のスクリプト
questions/      問題づくりの作業場所。Git に入れない（下の「問題づくり」）
```

- 決まり（入力の確かめ、出し分け、計算）は `src/server/` に置き、画面（`src/app/`、`src/components/`）には書かない
  - 理由：1つの決まりを、いちばん中心の層で1回だけ Vitest で確かめるため（testing スキル）。画面のテストは、結果がどの文言で出るかだけにできる
  - 前提（崩れたら見直す）：決まりを使うのはこのアプリの画面だけ。あとで作る「問題を取り出す API」も `src/server/` を呼ぶ
- データベースに触るのは `src/server/` だけ。画面の部品から直接 `db` を読まない
- `src/server/` のうち、データベースを使わない決まり（上限の値や文言など）は、ブラウザで動く画面の部品から読み込んでよい（例：Import が、送る前に大きさを確かめるため `src/server/import/validate.ts` を読む）
  - 理由：同じ決まりを、画面とサーバーの2か所に書き分けないため
  - 前提（崩れたら見直す）：読み込むファイルが、データベースやサーバーだけの仕組み（`next/headers` など）を読み込まない。読み込むようになったら、画面が使う部分を別のファイルに分ける
  - 例外：`src/server/questions/render.ts`（問題文・選択肢・解説を HTML にする）は、データベースを使わないが、画面の部品から読み込まない（下の「問題文・選択肢・解説の表示」）

## 問題文・選択肢・解説の表示

- Markdown の変換と本文の見た目は、シリーズで共通のパッケージ kinari-md（`docs/libraries/kinari-md.md`）に任せる。表示を直すときは、memory-forge に変換や上書きを足さず、kinari-md で直す
  - memory-forge で上書きするのは、入れ物ごとの文字の大きさ・書体と、選択肢の中のコードブロックの枠だけ（`src/styles/question-body.css`。入れ物は `src/components/rich-text.tsx` の `data-body` で分ける）
  - 理由：md-leaf と同じ見た目・同じ色分けを、アプリごとに書き分けずに保つため
  - 前提（崩れたら見直す）：kinari-md の本文の CSS が読むトークン（`--color-surface`・`--font-ui`・`--reading-size`・`--color-info` など）を、memory-forge の `tokens.css` が同じ名前で持つ。kinari-md の版を上げて読むトークンが増えたら、`tokens.css` に足す
- 変換はサーバーで行う。問題を画面に渡すサーバーの関数（`src/server/solve/start.ts`・`retry.ts`・`answer.ts`、`src/server/import/import.ts`）が、元の文字に加えて、`src/server/questions/render.ts` で変換した HTML を返す。Result の見直しは、答えたときに受け取った解説の HTML を持つ（`src/server/solve/result.ts`）。画面の部品は HTML を入れるだけにする
  - 理由：kinari-md の中の unified・highlight.js・KaTeX は、ブラウザに送ると大きい（数百 KB）。スマホでも解くので、ブラウザには HTML だけを送る。そのため `render.ts` は画面の部品から読み込まない
  - 前提（崩れたら見直す）：開くたびに変換しても重くない（1回に最大100問）。重くなったら、変換した HTML をデータベースに持つかを決め直す
- Manage の一覧や削除の確認のダイアログに出す問題文の1行目は、変換せずに元の文字のまま出す

## 解く画面の状態

- Setup・Solve・Result は、同じ URL（`/subjects/[id]`）の1つの画面で、ブラウザの中の状態だけで切り替える。今の問題・ここまでの正解と不正解の数・解き終わりの結果は、ブラウザにだけ持ち、データベースにも URL にも持たない
  - 理由：解いている途中で読み込み直したり閉じたりしたら、Setup からやり直す（`docs/specs/` の Solve）。ブラウザにだけ持てば、何もしなくてもそうなる。URL に選び方を入れると、読み込み直したときに同じ選び方で解き直しになり、random の並びも変わる
  - Result の間違えた問題の一覧と、そこから開く見直し（`review`）も、同じくブラウザにだけ持つ。見直しから戻ると、同じ Result を出す。解き直しの回も、受け取った問題をブラウザにだけ持つ（`retryAction` で今の中身を受け取り直す）
  - 答えた記録は、1問ごとにサーバーに送って残す（`src/server/solve/answer.ts`）ので、途中でやめても答えた分は残る
  - 前提（崩れたら見直す）：途中から続けて解けるようにしない。続けられるようにするなら、解いている状態をデータベースに持つ
- 上のバーが Setup・Result（ほかの画面と同じ）と Solve（quit と進み具合）で違うので、上のバーを付ける `(app)` のまとまりの外に置き、画面の中で出し分ける

## Manage の選び方

- Manage で選んでいる Subject の id・Topic の名前（All topics は null）・ページ・印の付いた問題だけを出すか（`flagged`）は、1つの cookie（`manage`。JSON）に持つ。名前は `src/app/(app)/manage/cookie.ts`
  - 画面（`src/app/(app)/manage/page.tsx`）は、cookie を読んで一覧をサーバーで組み立てる
  - 選び方を変えるアクション・消すアクション・印を外すアクション（`src/app/(app)/manage/actions.ts`）が cookie を書く。消すアクションは、消したあとに出す選び方を書く。cookie を書くと、Next.js が同じ画面をサーバーで組み立て直して返すので、一覧を読み直す処理を別に持たない
  - 読むときも書くときも `src/server/manage/selection.ts` の `parseSaved` で形を確かめ、なくなった Subject・Topic・ページは `resolveSelection` で今あるものに合わせる
- 理由：読み込み直したときと、ほかの画面（Home の「問題の管理」、Import の戻るリンク）から来たときに、同じ選び方のまま開くため。URL に持つと、リンクから来たときに選び方がなくなる
- 前提（崩れたら見直す）：選び方を、ほかの端末と分け合わない。ブラウザの戻るで、ページを1つずつ戻らなくてよい。cookie はブラウザを閉じるまでのもの（期限を付けない）

## テーマ

- 選んだテーマ（`system`・`light`・`dark`）は、ブラウザの `localStorage` の `theme` に持つ。ないとき・知らない値のときは `system`
- 明るさは `<html>` の `data-theme`（`light`・`dark`）で決める。`src/app/layout.tsx` の `<head>` に直に書いたスクリプトが、画面を描く前に付け、OS の設定が変わったときも付け直す
- 値を読み書きし `data-theme` を付ける処理は、`src/components/theme.ts` にだけ書く。`<head>` のスクリプトも、そこの関数を文字列にして作る
- 理由：開いた瞬間から選んだ明るさで出すため（サーバーは値を知らないので、描く前にブラウザで付ける）。cookie にしてサーバーで読むと、Cache Components でルートから下の全画面が開くたびに組み立てる画面になる
- 前提（崩れたら見直す）：選んだテーマを、ほかの端末と分け合わない（アカウントに持つなら、サーバーで読む作りに変える）。直に書いたスクリプトを CSP で止めるようにしたら、nonce が要る

## 問題づくり

- 問題のファイルは、Claude Code のスキル（`.claude/skills/make-questions/`）が、リポジトリの `questions/` に作る・直す。`questions/` は Git に入れない（`.gitignore` の `/questions/`）。人が読む作り方は `docs/questions.md`
  - 理由：作った問題は公開しない（`docs/overview.md` の「問題づくり」）。Claude Code の作業ディレクトリの中なので、確認なしで読み書きでき、スクリプトから同じ Subject のほかのファイルを探せる
  - 前提（崩れたら見直す）：問題の元はアプリの中身で、`questions/` は作業場所にすぎない。アプリには Import の画面からだけ取り込み、スクリプトやスキルからは取り込まない
- 確かめる `npm run questions:check` と ID を付ける `npm run questions:ids` は、決まりを `src/server/authoring/` に置き、`scripts/questions-check.ts`・`questions-ids.ts`・`questions-workspace.ts` はファイルを読み書きして、出力と終わりのコードを決めるだけにする
- 確かめは、Import と同じ `src/server/import/validate.ts` をそのまま使い、誤りの文言も同じにする
  - 理由：Import で止まるものを、作る時点ですべて見つけるため。決まりを1か所にし、Import の決まりを変えたら、スクリプトも何もしなくてもそろう
  - 前提（崩れたら見直す）：スクリプトは、node が型を外して直接動かす（`scripts/create-user.ts` と同じ）。そのため `scripts/questions-*.ts`・`src/server/authoring/` と、そこから読み込むファイル（`validate.ts`）は、データベース・サーバーだけの仕組み・`@/` の別名を読み込まず、読み込みを拡張子付きの相対パスで書く。崩れると `questions:check` が動かなくなるので気づける
- 確かめと ID を付けるときは、`questions/` の直下の、同じ Subject のほかのファイルの ID とも重ならないようにする（`src/server/authoring/workspace.ts`）。確かめでは、重なりを `id` の誤りにする
  - 理由：書き出したファイルを直して取り込み直すファイルと、新しく作ったファイルが、同じ Subject で `questions/` にあることがある。ID が重なると、新しい問題が Import で今ある問題を「置き換える」ことになるため
  - 前提（崩れたら見直す）：アプリに取り込み済みの問題の ID は、スクリプトから読まない（問題を取り出す API は、あとで作る機能）。`questions/` にない今の問題との重なりは、Import の取り込む前の確認（置き換わる数）で見る。API を作ったら、取り込み済みの ID とも比べる

## データベースのつながり方

| 使う場所 | Neon のブランチ | 接続先の置き場所 |
| --- | --- | --- |
| 本番（Vercel の Production） | main（Neon のいちばん上のブランチ） | Neon が管理する Vercel 連携が入れる |
| 確かめ用の公開（Vercel の Preview） | `preview/<Git のブランチ名>`（連携が公開ごとに作る） | 連携がその公開だけに入れる |
| 手元の開発（`npm run dev`） | `dev` | `.env.local` |
| 手元のテスト（Vitest、Playwright、画面を撮る） | `test` | `.env.test` |
| CI | `ci` | GitHub の Secret `DATABASE_URL` |

- すべてのブランチは、自分の Neon のアカウントの同じ1つのプロジェクトにある。Vercel とは、Vercel の Marketplace から入れた「Neon が管理する Vercel 連携」でつなぐ
- `dev`・`test`・`ci` は、Neon の画面で main から作ったブランチ。テストは自分で入れたデータだけを使い、始める前に表を空にする（main から写した本番のデータを当てにしない）
  - Vitest は、テストのファイルを並べずに1つずつ動かす（`vitest.config.mts` の `fileParallelism: false`）。データベースを使うファイルどうしが、同じデータベースの表を互いに空にしてぶつかるため
- Preview のブランチは、Git のブランチが消えたあと、次の Preview の公開のときに連携が消す（連携の「Automatically delete obsolete Neon branches」）。Git のブランチは、PR をマージすると GitHub が消す（リポジトリの「Automatically delete head branches」）
- 前提（崩れたら見直す）：無料のプランのブランチの上限は、1つのプロジェクトに10本。main・`dev`・`test`・`ci` の4本を除いて、同時に置ける Preview は6本。1タスク = 1PR で順に進めるので超えない
  - Vercel の Development 用のブランチ（連携の「Create a branch for your development environment」で作る `vercel-dev`）は作らない。手元は `.env.local` の `dev` を使い、作ると上限の1本を使うため
- 接続は `pg` の接続プールと `drizzle-orm/node-postgres`（`src/server/db/client.ts`）
  - 理由：取り込みで、途中で読んで判断するトランザクションを使うため。手元・CI・本番が同じ書き方になる
- つなぐときは、どこでも接続先の URL を `withVerifyFull`（`src/server/db/connection-url.ts`）に通し、`sslmode` を `verify-full` にする。サーバーの証明書と接続先の名前を確かめるため
  - 通している場所：`src/server/db/client.ts`・`drizzle.config.ts`・`scripts/create-user.ts`・`e2e/global-setup.ts`・`e2e/session.ts`・`e2e/questions.ts`。新しくつなぐ場所（`new Pool()` など）を作るときも通す
  - 理由：本番と Preview の接続先は連携が入れ、Preview は公開のたびに作られるので、人間が URL を書き換えられない。アプリの側で置き換えれば、どこでも同じ確かめ方になる
  - 前提（崩れたら見直す）：`pg` は、URL の `sslmode` を `ssl` の設定より優先する。`pg` の大きな版を上げるときは、`verify-full` の意味が変わっていないか確かめる
- 形の変更を当てる場所
  - 手元：`npm run db:generate` でファイルを作り、`npm run db:migrate` で `dev`・`test` に当てる
  - CI：テストの前に `ci` に当てる（`.github/workflows/ci.yml`）
  - 本番と確かめ用の公開：Vercel のビルドの最初に当てる（`vercel.json` の `buildCommand`）。接続プールを通さない `DATABASE_URL_UNPOOLED` を使う（`drizzle.config.ts`）。当て方の決まりは「どこでも守る決まり」の「データベースの形の変更は「足す」ものにする」
- 秘密の値は `.env.local`・`.env.test`（Git に入らない）、GitHub の Secret、Vercel にだけ置く。`.env.example` に名前だけを書く
  - データベースの接続先（`DATABASE_URL`）のほかに、ログインの cookie の署名に使う `BETTER_AUTH_SECRET` と、アプリの URL の `BETTER_AUTH_URL` を置く（GitHub の Secret は `BETTER_AUTH_SECRET` だけ。CI の URL は `ci.yml` に書く）。`BETTER_AUTH_SECRET` は置く場所ごとに別の値にする
  - 自分の Google アカウントのメールアドレス `OWNER_GOOGLE_EMAIL` を、手元と本番の接続先を書いたファイルに置く。`npm run user:create` だけが読む（「データ」の「ログイン」）
  - Google でのログインに使う `GOOGLE_CLIENT_ID`・`GOOGLE_CLIENT_SECRET` を、手元と Vercel の本番に置く。Google に登録する戻り先（`<アプリの URL>/api/auth/callback/google`）は、本番と `http://localhost:3000` だけ
  - Vercel の Preview には `BETTER_AUTH_URL` を置かない。公開のたびに URL が変わるため。置かないと Better Auth はアクセスされた URL を使う
  - 前提（崩れたら見直す）：Preview では Google でのログインを使わない（戻り先を Google に登録できないため。押すとエラーの帯になる）。Preview で使うなら、決まった URL を用意して登録し、`BETTER_AUTH_URL` の扱いも決め直す

## ログインの確かめ

- ログインしているかは、`src/proxy.ts` で、すべての画面の前に DB まで確かめる。ログインしていなければ `/login?next=<開こうとしていたパス>` に移す
  - 理由：期限切れも含めて1か所で確かめ、開こうとしていた画面を各画面から渡さずに済ませるため
  - ログインしていなくても開ける画面は `/login` だけ。足すときは、`src/proxy.ts` の一覧に足す
  - Next.js が配るファイル（`/_next/`）と、Google からの戻り先（`/api/auth/`）には動かさない。紐づけではログインしたまま戻ってくるので、`/login` のように「ログインしていたら Home に移す」扱いにはできないため。戻り先が正しいかは、Better Auth が state の cookie で確かめる
- データを読み書きする `src/server/` の関数を呼ぶサーバーアクションは、proxy に頼らず、自分でもセッションを確かめる（`src/server/auth/session.ts` の `requireSession()`。ログインしていなければ `/login` に移す）。`src/server/` の関数そのものは、セッションを確かめない
  - 理由：proxy の対象から外れたパスや、画面を移したサーバーアクションは、proxy を通らずに呼べるため。ブラウザから呼べる入口はアクションだけなので、確かめるのは入口の1か所で足りる。中の決まりをログインに縛らず、テストを簡単に保てる
  - 前提（崩れたら見直す）：`src/server/` の関数を、ブラウザから直接呼べる形（`"use server"` のファイルや、HTTP の入口）にしない。問題を取り出す API などの入口を作るときは、その入口で確かめる
- 前提（崩れたら見直す）：Next.js の proxy が Node.js で動き、DB につなげる。使う人がひとりなので、画面を開くたびに DB を1回読んでも重くならない

## 画面の画像を撮る・比べる仕組み

- 撮る・比べるは、Playwright 公式の Docker イメージ（`mcr.microsoft.com/playwright:v<入れた @playwright/test の版>-noble`）の中で、アプリのビルドと立ち上げも含めて行う。同じイメージにする理由は screenshots スキル
  - 手元：`npm run screens:test`・`npm run screens:update -- <画面のテストのファイル>`（`scripts/screens.mjs` が `docker run` する）
  - CI：`screens` のジョブの `container:` に同じイメージを指定する
  - 前提（崩れたら見直す）：イメージの版は、入れた `@playwright/test` の版から決めている（`scripts/screens.mjs` と `ci.yml`）。違うと、イメージの中のブラウザと合わない
- Playwright の `webServer` で `next build` と `next start` をし、`test`（CI では `ci`）のデータベースにつなぐ（`playwright.config.ts`）
- 基準の画像は `docs/specs/screens/<画面>-<状態>.png`（OS 名を入れない）
- 撮るたびに変わるものを止める
  - 日時：ブラウザの日時を `page.clock` で固定する（`e2e/fixtures.ts`）。画像を撮るテストは、ここの `test` を使う
  - 書体：`src/styles/tokens.css` の書体の並びは OS の書体（ヒラギノ・游ゴシック・ヒラギノ明朝・游明朝・ui-monospace など）を先に置き、最後に `next/font` でアプリから配る Noto Sans JP・Noto Serif JP・Geist Mono を置く（`src/app/layout.tsx`）。Docker のイメージには OS の書体がないので、配った書体で決まって撮れる。イメージに入っている書体に頼らない
  - サーバーの日時：サーバーで「今」を使うところ（Home の連続日数）は `src/server/clock.ts` の `now()` を呼ぶ。`now()` は環境変数 `FIXED_NOW` があればその日時を返す。`FIXED_NOW` は `playwright.config.ts` の `webServer.env` にだけ置き、値はブラウザの日時と同じ `e2e/fixtures.ts` の定数にする（ほかの環境変数のファイル・GitHub の Secret・Vercel には置かない）
    - 理由：サーバーで組み立てる画面の日付（今日）を、撮るたびに同じにするため
    - 答えを記録するとき（`src/server/solve/answer.ts`）は、今のままデータベースの `now()` で答えた日時を入れる。画面のテストで答えの日時を決めたいときは、`e2e/questions.ts` の `insertAnswers` で日時を指定して入れる
    - 前提（崩れたら見直す）：画面のテストの中で、Solve で答えてから Home の連続日数を見ることはしない（答えは今の日時、Home は固定した日時で数えるため合わない）
  - アニメーション：`toHaveScreenshot` の既定で止まる
  - CPU による描き方の違い：Playwright の Chromium に `--disable-skia-runtime-opts` を付ける（`playwright.config.ts`）。Skia が CPU を見て速い描き方を選ぶのを止め、どの機械でも同じ描き方にする。CI の `screens` のジョブは、最初に CPU の名前とフラグを出す（`ci.yml`）
    - 理由：CI の機械によっては、太字（Noto Sans JP は可変書体で、700 は 400 と同じファイルを太くして描く）の文字だけが、決まった形でわずかに違って描かれ、多くの画面の比べが失敗するため。書体の読み込みの遅れではない（Playwright は撮る前に `document.fonts.ready` を待ち、差のある文字も太さは同じ）
    - 前提（崩れたら見直す）：違いが Skia の CPU ごとの描き方から来ている（確かめきれていない）。フラグを付けても同じ失敗が出たら、出した CPU を通った回と比べ、太字を固定の太さの書体のファイルにするか決め直す
- 状態（0件など）は、テストの前に `test` のデータベースに決まったデータを入れて作る（screenshots スキル）
  - Subject と問題は、テストごとに `e2e/questions.ts` の `resetQuestions` で入れ直す
  - 画面のテストは、ファイルを並べずに1つずつ動かす（`playwright.config.ts` の `workers: 1`）。並べると、ほかのファイルのテストが入れ直したデータで、撮っている画面が変わるため
- ログインが要る画面は、テスト用のユーザーでログインした状態で撮る
  - global setup（`e2e/global-setup.ts`）が、`test`（CI では `ci`）のデータベースの表を空にし、テスト用のユーザーを `scripts/insert-user.ts` で作り、ログインした cookie を `e2e/.auth/` に保存する。ログインが要るテストは、それを `storageState` で使う
    - cookie は、`e2e/session.ts` で Better Auth の `testUtils` プラグインを付けた auth を作り、`getCookies` で作る（本物の Google の画面は通せないため）。global setup と、sign out でセッションを消すテストが使う。本番の `src/server/auth/auth.ts` には付けない
    - 前提（崩れたら見直す）：`testUtils` が作る cookie の名前と署名が、アプリの auth と同じ（同じ環境変数の `BETTER_AUTH_SECRET`・`BETTER_AUTH_URL` を読む）。合わなくなると、ログインが要る画面のテストがすべて Login に移って失敗するので気づける
  - テスト用のユーザーのメールアドレスは、`e2e/test-user.ts` に書いた決まった値（`test`・`ci` のデータベースにだけ入る）
  - 前提（崩れたら見直す）：Vitest と Playwright を同じ `test` のデータベースで同時に動かさない。どちらも始める前に表を空にするので、ぶつかる
- サーバーで組み立てる画面（Home・Setup）の読み込み中と、読み込めなかった状態は撮らない
  - テスト用のデータベースでは、読み込みを止めたり失敗させたりできないため（ブラウザからのアクションの返事は `page.route` で止められるので、Solve の読み込み中と保存のエラーは撮る）
  - 代わりに、合意したプロトタイプの画像を見本にし、コードを見て確かめる

## データ

<!-- 保存するものの持ち方（テーブルなど）と、その理由・前提 -->

- ログイン
  - `user`・`session`・`account`・`verification`：Better Auth の表。形は Better Auth が決める（`src/server/db/schema.ts`）。`session` は、ログインしている端末ごとの行で、期限を持つ。`account` には、紐づけた Google アカウントごとの行（`provider_id = 'google'`）が入る（パスワードの行はない）
  - アカウント（`user` の行）は1つだけ。その `email` は自分の Google アカウントのメールアドレス（環境変数 `OWNER_GOOGLE_EMAIL`）と同じにし、`email_verified` を true にする
    - 自分の Google アカウントは、Login で初めて選んだときに、Better Auth の自動の紐づけで `google` の行が足される（`src/server/auth/auth.ts`）。`user.email` と違うメールアドレスの Google アカウントは、Settings で紐づけたものだけが入れる
    - 理由：Better Auth の仕組みのままで、環境変数に書けるメールアドレスから自分の Google アカウントを決められるため
    - 自分の Google アカウントを変えるときは、`OWNER_GOOGLE_EMAIL` を書き換えて `npm run user:create` を当て直す
    - 前提（崩れたら見直す）：アカウントは1つだけ。増やすなら、自動の紐づけでほかの人のアカウントに紐づかないか決め直す
  - アカウントの行は、`scripts/insert-user.ts` で入れる（なければ作り、あれば `email` を合わせる）。`npm run user:create` と、テスト（Vitest・画面のテストの global setup）がこれを使う
    - 前提（崩れたら見直す）：Better Auth の sign up と同じ形の行を、手で入れている。Better Auth の版を上げて行の形が変わったら、ここを直す。画面のテストが、global setup で作ったアカウントでログインした状態で通ることで気づける
- 問題
  - `subjects`：Subject ごとの行。名前は重ならない
  - `questions`：問題ごとの行。Subject とファイルの ID の組み合わせは重ならない（データベースの決まりでも守る）。Subject を消すと、その問題も消える
  - 問題が1つもなくなった Subject は、Manage で Topic や1問を消すときに、同じトランザクションの中で消す（`src/server/manage/delete.ts`）
    - 理由：Home の一覧（`src/server/subjects/subjects.ts`）は `subjects` の表をそのまま並べるので、残すと問題のない Subject が出るため。Manage の一覧（`src/server/manage/list.ts`）は、問題のある Subject だけを並べる
    - 前提（崩れたら見直す）：問題を減らす操作は Manage の削除だけ（取り込み直しは問題を消さない）。問題を消すほかの操作を足すときは、同じように空の Subject を消す
  - Topic は表にせず、`questions` の列に名前で持つ。Topic の一覧は、問題を Topic の名前でまとめて作る
    - 理由：Topic は Subject の中の名前で見分ける（`docs/overview.md`）。問題が1つもなくなった Topic は、何もしなくても消える
    - 前提（崩れたら見直す）：Topic に、名前のほかの情報（並び順、説明など）を持たせない。持たせるなら表にする
  - 選択肢と正解は、`questions` の JSON の列に持つ。正解は選択肢の記号（A〜H、選択肢の並び順）の並び
    - 理由：選択肢ごとに記録や印を持たず、1問を1行で読み書きできるため
    - 前提（崩れたら見直す）：選択肢ごとに記録や印を持たない。持たせるなら表にする
  - 誤りがありそうだと付けた印は、`questions.flagged`（真偽）に持つ。印の付いた問題は、出題しない（`src/server/solve/start.ts`）、Setup の数に入れない（`setup.ts`）、Result で数えない（`result.ts`）、Home と Setup の身についている具合に数えない（`src/server/subjects/subjects.ts`・`src/server/solve/setup.ts`）、連続日数の取り組んだ日に数えない（`src/server/streak/answered-days.ts`。Manage で消すときも、印の付いた問題の答えは `deleted_answers` に写さない）。取り込みで置き換わったら、印を外し、その問題の記録を消す（`src/server/import/import.ts`）
    - 理由：直すまで出題から外し、誤った問題で付いた記録で正答率がずれないようにするため。どこも同じ列を同じ意味で読むので、1つの列にしている
    - 前提（崩れたら見直す）：印は1つの問題に1つで、付けた日時や理由のメモを持たない。持たせるなら、印の表にする
  - 持ち主（どのユーザーの問題か）の列は持たない
    - 前提（崩れたら見直す）：使う人はひとり。複数人で使うときに足す
  - 問題の文字（Subject・Topic・ID・問題文・選択肢・解説）は、ファイルに書かれたまま（前後の空白も含めて）持ち、比べる。前後の空白を除くのは、空かどうかを見るときだけ（`src/server/import/validate.ts`・`diff.ts`・`import.ts`）
    - 理由：問題文・選択肢・解説のコードの字下げを崩さないため
- 記録
  - `answers`：答えるたびに（submit とスキップ）1行足す。正解か（スキップは不正解）と答えた日時を持つ。問題を消すと、その記録も消える（答えた日時だけは、消す前に `deleted_answers` に写す）
  - 問題ごとの正答率と解いた回数、最後の答え、答えた日は、どれもこの表から数える（数を `questions` の列に持たない）。答えた日だけは、下の `deleted_answers` からも数える
    - 理由：正答率が低い順の出題、身についている具合（最後の答え）、連続日数（答えた日）が、同じ記録から数えられるため
    - 前提（崩れたら見直す）：使う人はひとりで、行は数万ほどにしかならない。数えるのが重くなったら、数をまとめた表を足す
  - `deleted_answers`：Manage で問題を消すとき（`src/server/manage/delete.ts`）、消える問題のうち印のない問題の記録の答えた日時を、同じトランザクションの中で写す。連続日数の答えた日は、`answers`（印のない問題）とこの表の両方から数える（`src/server/streak/answered-days.ts`）
    - 理由：記録を読むほかのところ（Manage の一覧・身についている具合・出題・Setup・Home の数）を変えずに、連続日数だけに消した問題の答えを残せるため。消した問題は、どこにも出ず、正答率や解いた回数にも入らない。同じ ID で取り込み直した問題は新しい `questions.id` になるので、まだ解いていない問題になる
    - 前提（崩れたら見直す）：消した問題の答えを使うのは連続日数だけ。消した問題の正答率などを見せるなら、持ち方を見直す
    - 前提（崩れたら見直す）：問題を消す操作は Manage の削除だけ（取り込みで印の付いた問題が置き換わるときに消える記録は、もともと連続日数に数えないので写さない）。問題や記録を消すほかの操作を足すときは、同じように写す
    - 前提（崩れたら見直す）：行は答えの数だけ増える。`answers` と同じく、使う人はひとりで数万行ほどまで
  - 取り込み直しは同じ問題の行を書き換えるので、`questions.id` は変わらず、記録は残る（印の付いた問題が置き換わるときは、消す）

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

### Better Auth の HTTP の入口は戻り先の1本だけ

- 決まり：ブラウザから呼べる Better Auth の入口は、Google からの戻り先（`src/app/api/auth/callback/google/route.ts`）だけ。`/api/auth/[...all]` は置かない。sign in・sign out・紐づけなどは、サーバーの中（`src/server/auth/`、サーバーアクション）から `auth.api` を呼ぶ
- 理由：`/api/auth/[...all]` を置くと、`/unlink-account` を直接呼んで、サーバーアクションの止め（自分の Google アカウントは外せない。`src/app/(app)/settings/actions.ts`）を通らずに紐づけを外せてしまう。画面から使っていない Better Auth の機能も呼べてしまう。`disabledPaths` で塞ぐやり方は、塞ぎ忘れた機能をブラウザから呼べてしまう
- 前提（崩れたら見直す）：Google の戻り先のほかに、ブラウザから直接 Better Auth を呼ぶ必要がない。足すときは、1本ずつルートを置く
- 当てはまる場所：`src/server/auth/auth.ts` と、`src/app/api/auth/` のルート

### トークンにない値は、ESLint で止める

- 理由：`docs/ui.md` の「トークンにない値を使わない」を、人の目に頼らずに守るため。`src/styles/tokens.css` の先頭で Tailwind の既定の色・文字などを `initial` で消しているので、トークンにない色や文字の大きさのクラスは `no-unknown-classes` で止まる。`p-[13px]` のような書いた値は Tailwind では正しいクラスなので、`[` を含むクラスを `no-restricted-classes` で止める（`eslint.config.mjs`）
- 前提（崩れたら見直す）：`tokens.css` の先頭の `--color-*: initial` などの行がある。プロトタイプから写し直してこの行が消えると、Lint は何も言わずに止めなくなる。止めるのは `className` の中だけで、`style` や CSS ファイルに書いた値は止まらない
- 当てはまる場所：`src/` のすべての `.ts`・`.tsx`

### 依存パッケージの中の版を、`overrides` で上書きする

- `zod` を 4.6.7 以上にする（`package.json` の `overrides`）
- 理由：`@vercel/functions` の中の `@vercel/cli-config` が、脆弱性のある `zod` 4.1.11 を決め打ちで使っていて、`@vercel/functions` の新しい版でも直っていないため（#54）。Better Auth も同じ `zod` を使うので、1つの版にそろう
- 前提（崩れたら見直す）：`@vercel/cli-config` が `zod` 4 の新しい版でも動く。`@vercel/functions` を上げたときに、中の `zod` が 4.6.6 以上になっていれば、この上書きを消す
- 当てはまる場所：`package.json`（JSON にはコメントを書けないので、理由はここに書く）
