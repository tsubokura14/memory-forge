# Vitest

書いた時点のバージョン：vitest 5.0.3

## 簡単な説明

TypeScript のコードを、そのまま速く実行して確かめるテストの道具。書き方は Jest とほぼ同じ（`test`、`expect`）。

- 公式：https://vitest.dev/

## このプロジェクトで使っている部分

- 設定：`vitest.config.mts`
  - テストのファイルは `src/` の中の `*.test.ts`・`*.test.tsx`。確かめるファイルの横に置く
  - `@/` の別名は、`tsconfig.json` の `paths` から読む（`resolve.tsconfigPaths`）
  - テストが1つもなくても、`npm test` を成功にする（`passWithNoTests`）
- 実行のしかたは `CLAUDE.md` の「よく使うコマンド」
- 画面を通したテストと画像の比べは Vitest ではなく Playwright で行う
