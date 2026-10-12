# ESLint

書いた時点のバージョン：eslint 9.39.5、eslint-config-next 16.4.0、eslint-config-prettier 10.1.8、eslint-plugin-better-tailwindcss 4.9.0

## 簡単な説明

コードの書き方の誤りや、危ない書き方を見つける道具。見つけるだけで、整形は Prettier に任せる。

- 公式：https://eslint.org/docs/latest/
- Next.js の設定：https://nextjs.org/docs/app/api-reference/config/eslint

## このプロジェクトで使っている部分

- 設定：`eslint.config.mjs`（flat config）
  - `eslint-config-next/core-web-vitals`：Next.js・React・React Hooks のルール
  - `eslint-config-next/typescript`：TypeScript のルール（`any` を使わないなど）
  - `eslint-config-prettier/flat`：Prettier とぶつかる、書式についてのルールを止める
  - `eslint-plugin-better-tailwindcss`：Tailwind のクラスを調べる（https://github.com/schoero/eslint-plugin-better-tailwindcss）。`src/styles/globals.css` を読んで、使えるクラスを知る。使っているのは2つのルールだけ
    - `no-unknown-classes`：Tailwind にないクラス（トークンにない色や文字の大きさも）を止める
    - `no-restricted-classes`：`[` を含むクラス（`p-[13px]` のような書いた値）を止める
- `npm run lint` で、ESLint と Prettier の確かめをまとめて動かす
- Next.js 16 から `next lint` はなくなり、ESLint を直接動かす
