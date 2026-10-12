# Playwright

書いた時点のバージョン：@playwright/test 1.64.0（Docker イメージ `mcr.microsoft.com/playwright:v1.64.0-noble`）

## 簡単な説明

本物のブラウザを動かして、画面を通したテストをする道具。画面を撮って、前に撮った画像と比べることもできる（`toHaveScreenshot`）。

- 公式：https://playwright.dev/docs/intro
- 画像を比べるテスト：https://playwright.dev/docs/test-snapshots
- Docker：https://playwright.dev/docs/docker

## このプロジェクトで使っている部分

- `playwright.config.ts`：設定
  - `webServer`：テストの前に `npm run build && npm run start` でアプリを立ち上げる
  - `snapshotPathTemplate`：基準の画像の場所と名前を `docs/specs/screens/<名前>.png` にする（ふだんはテストの横のフォルダに、OS 名の入った名前で置かれる）
- `e2e/*.spec.ts`：画面のテスト。`e2e/fixtures.ts` の `test` を使う（`page.clock` でブラウザの日時を固定している）
- `toHaveScreenshot("<画面>-<状態>.png")`：基準の画像と比べる。基準がなければ失敗する。アニメーションは止め、書体の読み込みを待ってから撮る
- `--update-snapshots=changed`：違っていた画像と、なかった画像だけを撮り直す
- `scripts/screens.mjs`：公式の Docker イメージの中で `npm ci` とテストを動かす。`npm run screens:test`・`npm run screens:update` から呼ぶ
