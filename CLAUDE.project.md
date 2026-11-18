<!--
このプロジェクトだけのAIへのルール。Claude Code は CLAUDE.md から @ で読み込み、GitHub Copilot は AGENTS.md の指示で読む。
AGENTS.md と CLAUDE.md はテンプレートのものなので、このプロジェクトで決まりを足すときはこのファイルに書く（docs/template-files.md）
-->

# このプロジェクトのルール

## 技術

<!-- 立ち上げで決めたら書く。詳しくは docs/overview.md -->

- Next.js 16（App Router、TypeScript、Cache Components を有効）、React 19
- Tailwind CSS 4（トークンは `src/styles/tokens.css`）
- Prism（`prismjs`。コードブロックの色分け。`src/server/questions/highlight.ts`）
- Neon（PostgreSQL）と Drizzle ORM（drizzle-kit で形の変更を管理）
- Better Auth（Google アカウントでのログイン。`src/server/auth/`）
- Vitest（中の決まりのテスト）、Playwright（画面を通したテストと、Docker の中での画像の比べ）
- ESLint（`eslint-config-next`、`eslint-plugin-better-tailwindcss`）と Prettier（整形）。編集したファイルは、フック（`scripts/format-on-edit.mjs`）が自動で整形する
- GitHub Actions（PR ごとの CI）、Vercel（公開）
- パッケージの管理は npm
- 選んだ理由は `docs/overview.md` の「技術」

## よく使うコマンド

<!-- 起動、テスト、Lint、型チェック、本番の画面を撮り直す、画像を比べるテスト -->

| コマンド | すること |
| --- | --- |
| `npm run dev` | 手元でアプリを立ち上げる（http://localhost:3000） |
| `npm test` | Vitest のテストを全部実行する |
| `npm test -- <ファイル>` | 1つのファイルのテストだけを実行する |
| `npm test -- -t <名前>` | 名前で選んだテストだけを実行する |
| `npm run lint` | ESLint と Prettier の確かめ（直さない） |
| `npm run format` | Prettier で整形する |
| `npm run typecheck` | 型チェック |
| `npm run build` | 本番用にビルドする |
| `npm run screens:test` | Docker の中で、画面の画像を基準（`docs/specs/screens/`）と比べる。Docker Desktop が要る |
| `npm run screens:update -- <画面のテストのファイル>` | Docker の中で、指定した画面だけを撮り直す（例：`npm run screens:update -- e2e/home.spec.ts`） |
| `npm run db:generate` | 表の定義（`src/server/db/schema.ts`）から、形の変更のファイルを `drizzle/` に作る |
| `npm run db:migrate` | 形の変更を、`dev`（`.env.local`）と `test`（`.env.test`）のデータベースに当てる |
| `npm run user:create -- --env-file=<接続先の .env のファイル>` | 自分のアカウントを作る、または自分の Google アカウント（ファイルの `OWNER_GOOGLE_EMAIL`）に合わせる |

## うまくいかなかったことから追加したルール

<!-- 同じ注意を2回しないために、日付つきで書き足す。使わなくなったら消してよい。例：
- 2026-09-17: 日付の比較は、時刻を切り捨ててから行う
-->

- 2026-11-01: 境界や空のとき、文言の出し分けなど、仕様にない細かい場合に気づいたら、実装する前に一覧にして聞く（実装の中で決めない）
- 2026-11-14: `npm test` と `npm run screens:test` は同じテスト用のデータベースを使うので、同時に実行せず、順番に実行する（同時だと両方とも失敗する）
- 2026-11-14: Bash のコマンドに「.env」の文字を入れない（grep のパターンや heredoc の中の文でも、フックに止められる）。秘密のファイルでないものをその文字で探す・書き換えるときは、Grep・Read・Edit を使う。それでも止められたら、止まって人間に伝える
- 2026-11-14: サブエージェント `test-runner` が `npm run screens:test` の終わりを待てずに戻ってきたら、呼ぶ側がバックグラウンドで実行し、終わるまで待って結果を確かめる（`npm test` と同時に実行しない決まりは同じ）
- 2026-11-17: 「.env」の文字が入るファイル（`.env.example` など）をコミットに入れる必要があるときは、文字を組み立てるなどしてフックを避けようとせず、人間にコミットを頼む
- 2026-11-17: 人間に頼んだコミットや push のあとは、`git status` と `git log` で入ったことを確かめてから次へ進む
