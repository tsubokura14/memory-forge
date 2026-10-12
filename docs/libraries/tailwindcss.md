# Tailwind CSS

書いた時点のバージョン：tailwindcss 4.3.3、@tailwindcss/postcss 4.3.3

## 簡単な説明

`className` に `bg-bg` や `text-lg` のような短いクラスを並べて見た目を書く道具。使ったクラスの分だけ CSS が作られる。

- 公式：https://tailwindcss.com/docs
- Next.js での入れ方：https://tailwindcss.com/docs/installation/framework-guides/nextjs

## このプロジェクトで使っている部分

- 4 から、設定は JavaScript のファイルではなく CSS の `@theme` に書く。`@theme` に書いた `--color-bg` から `bg-bg`・`text-bg` などのクラスができる
- `src/styles/tokens.css`：トークン。`--color-*: initial` のように書くと、Tailwind の既定の値（色など）が消え、`@theme` に書いた値のクラスだけが作られる
- `src/styles/globals.css`：Tailwind とトークンを読み込む。`src/app/layout.tsx` で読み込む
- `postcss.config.mjs`：Next.js のビルドで Tailwind を動かす（`@tailwindcss/postcss`）
- ダークモードは、`tokens.css` の `[data-theme="dark"]` で同じ名前の値を上書きする
