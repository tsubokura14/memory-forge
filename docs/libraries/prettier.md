# Prettier

書いた時点のバージョン：prettier 3.9.10

## 簡単な説明

コードの書式（インデント、改行、引用符など）を自動でそろえる道具。

- 公式：https://prettier.io/docs/

## このプロジェクトで使っている部分

- 設定：`.prettierrc.mjs`。ほぼ既定のまま
  - 改行の種類だけ、ファイルの今の改行に合わせる（`endOfLine: "auto"`）
- 対象から外すもの：`.prettierignore`。Markdown などの文書は人が書くので整形しない
- `npm run format` で整形し、`npm run lint` で整っているかを確かめる
