# material-symbols

書いた時点のバージョン：material-symbols 0.47.6

## 簡単な説明

Google の Material Symbols（アイコン）を、Web フォントのファイルとして配る npm のパッケージ。アイコンの名前（`hardware` など）を文字として書くと、書体の合字で絵になる。Outlined・Rounded・Sharp の3種類の書体が入っていて、塗りや太さは `font-variation-settings` で変えられる。

- パッケージ：https://www.npmjs.com/package/material-symbols
- アイコンの一覧：https://fonts.google.com/icons

## このプロジェクトで使っている部分

- `material-symbols-outlined.woff2`（Outlined の書体）だけを、`next/font/local` で読み込む（`src/app/layout.tsx`）。パッケージの CSS は読み込まない
- アイコンを出すクラスは、`src/styles/globals.css` の `icon`（パッケージの `.material-symbols-outlined` と同じ指定のうち、大きさを除いたもの）
- 書体のファイルは約4MB。すべてのアイコンが入っているので、使うアイコンを足しても読み込むものは変わらない
