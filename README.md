<!--
この README は、GitHub でリポジトリを見た人向けの説明。
このようなコメントは GitHub では表示されない。
開発の進め方と立ち上げの手順は docs/how-we-work.md にある。
-->

# memory-forge

資格試験などの勉強のために、Claude に作らせた選択式の問題を解く Web アプリ。プログラミング系の題材も扱えるように、問題文・選択肢・解説のコードを色付きで表示する。

- 公開先：https://memory-forge-wine.vercel.app
- **開発中**：今は開発の土台（テスト・画面の画像の比べ・自動のチェック・公開）ができたところで、画面はアプリ名だけ。下の機能はこれから作る

## 主な機能

- **問題の取り込み**：Claude Code に作らせた問題のファイル（JSON か CSV）を、画面から取り込む。誤りがあれば、どの問題のどこが誤りかを出し、何も取り込まない。取り込む前に、増える・置き換わる問題を見せる
- **解く**：Subject（例：AWS SAA、Python）の中の Topic を1つ、または全部を選び、問題数と出題の順番（正答率が低い順など）を選んで解く。1つを選ぶ問題と、当てはまるものをすべて選ぶ問題がある
- **答え合わせ**：1問ごとに正解・不正解と解説を出す。解き終わったら、正答率と Topic ごとの結果を出す
- **記録**：問題ごとの正答率、Subject と Topic ごとの身についている具合、毎日続けている日数（連続日数）を出す
- **不備の印**：誤りのありそうな問題に印を付け、その問題を書き出して直し、取り込み直す
- **書き出し・削除**：問題を Subject ごとにファイルに書き出す。Subject・Topic・1問ずつ消せる
- **ログイン**：自分のメールアドレスだけが入れる（Google アカウントを紐づけてもよい）。PC とスマホで記録を共有する

画面の表記は英語。くわしくは [docs/overview.md](docs/overview.md)。

## 使っている技術

| 用途 | 使うもの |
| --- | --- |
| 言語・フレームワーク | Next.js 16（App Router、TypeScript、Cache Components）、React 19 |
| 見た目 | Tailwind CSS 4 |
| データベース | Neon（PostgreSQL）、Drizzle ORM |
| テスト | Vitest、Playwright（画面を通したテストと、画面の画像の比べ） |
| 整形・Lint | Prettier、ESLint |
| 自動のチェック | GitHub Actions |
| 公開 | Vercel（main は本番に、PR は確かめ用の URL に自動で公開） |

選んだ理由は [docs/overview.md](docs/overview.md) の「技術」。

## セットアップ

### 必要なもの

- Node.js 24 と npm
- Neon のプロジェクトと、開発用（`dev`）・テスト用（`test`）のブランチ
- Docker Desktop（画面の画像を撮る・比べるときだけ）

### 手順

```bash
git clone https://github.com/tsubokura14/memory-forge.git
cd memory-forge
npm install
cp .env.example .env.local   # DATABASE_URL に、Neon の dev ブランチの接続先を入れる
cp .env.example .env.test    # DATABASE_URL に、Neon の test ブランチの接続先を入れる
npm run db:migrate           # dev と test のデータベースに、形の変更（マイグレーション）を当てる
npm run dev                  # http://localhost:3000 で開く
```

`.env.local` と `.env.test` は Git に入らない。

## 開発コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 手元でアプリを立ち上げる（http://localhost:3000） |
| `npm test` | Vitest のテストを実行する |
| `npm run lint` | ESLint と Prettier の確かめ（直さない） |
| `npm run format` | Prettier で整形する |
| `npm run typecheck` | 型チェック |
| `npm run build` | 本番用にビルドする |
| `npm run screens:test` | Docker の中で、画面の画像を基準（`docs/specs/screens/`）と比べる |
| `npm run screens:update -- <画面のテストのファイル>` | Docker の中で、指定した画面だけを撮り直す |
| `npm run db:generate` | 表の定義から、形の変更のファイルを作る |
| `npm run db:migrate` | 形の変更を、dev と test のデータベースに当てる |

## ドキュメント

| ファイル | 内容 |
| --- | --- |
| [docs/overview.md](docs/overview.md) | 目的、やらないこと、技術、用語 |
| [docs/specs/](docs/specs/) | アプリが今どう動くか、今の画面 |
| [docs/design.md](docs/design.md) | アプリが今どう作られているか（複数の場所に関わる決まりと、その理由） |
| [docs/ui.md](docs/ui.md) | 見た目の決まり（色・余白・文字・部品の使い分け） |
| [docs/changes/](docs/changes/) | 機能ごとの変更の記録（何を・なぜ・どう変えたか） |
| [docs/libraries/](docs/libraries/) | コードを読むために必要なライブラリの前提知識 |
| [docs/how-we-work.md](docs/how-we-work.md) | 開発の進め方 |
| [docs/process/](docs/process/) | 進め方のうち、AIが作業で守る決まり（テストの基準、画面の撮り方など） |
