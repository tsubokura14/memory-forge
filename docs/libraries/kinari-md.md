# kinari-md

書いた時点のバージョン：kinari-md 0.2.0（`github:tsubokura14/kinari-md#v0.2.0`）

## 簡単な説明

シリーズのアプリ（md-leaf、memory-forge）で共有する、Markdown の変換と本文の見た目のパッケージ。npm には公開しておらず、GitHub のタグを指定して入れる。TypeScript のまま配られるので、`next.config.ts` の `transpilePackages` でアプリの Next.js がビルドする。

中で unified（remark・rehype）・highlight.js・KaTeX などを使う。HTML のタグは文字のまま出し、決まった形のほかのリンクと画像は通さない。

- リポジトリ：https://github.com/tsubokura14/kinari-md
- 入口と使い方：リポジトリの `README.md`。詳しい動きは `docs/specs/markdown.md`

## このプロジェクトで使っている部分

- `kinari-md/markdown` の `renderMarkdown` を、`src/server/questions/render.ts` だけで呼ぶ（サーバーで HTML にする）
  - 問題文：`syntax: "code"`（段落・改行・文の中のコード・コードブロックだけ）、`lineNumbers: true`
  - 選択肢：`syntax: "code"`
  - 解説：`syntax: "all"`（すべての書き方）
- `resolve`（リンクと画像の書き換え）と、戻り値の `title`・`headings`・`brokenLinks`・`brokenImages` は使わない
- `kinari-md/mermaid`（`drawMermaid`）は使わない。```` ```mermaid ```` はコードブロックのまま出る
