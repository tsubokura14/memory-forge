# prismjs

書いた時点のバージョン：prismjs 1.30.0（型は @types/prismjs 1.26.6）

## 簡単な説明

コードの色分けのライブラリ。言語ごとの文法（正規表現の表）でコードを言葉の種類（`keyword`・`string`・`comment` など）に分ける。ふつうはページの `<code class="language-xxx">` を探して HTML を書き換えて使うが、`Prism.tokenize` で、分けた結果をデータとして受け取ることもできる。待たずに結果を返す。

- 公式：https://prismjs.com/
- 言語の一覧と、言語どうしの依存：https://prismjs.com/#supported-languages

## このプロジェクトで使っている部分

- `src/server/questions/highlight.ts` だけで使う。`Prism.tokenize` の結果を、6つの色の種類（`text-code-*` のトークン）と `null` の並びにして、`src/components/code-block.tsx` が `<span>` で出す
- Prism の HTML の書き換え（`Prism.highlight`・`highlightAll`）と、Prism のテーマの CSS は使わない。色はトークンで付ける
- 本体（`prismjs`）には markup・css・clike・javascript が入っている。ほかの言語は `prismjs/components/prism-<言語>` を読み込むと、グローバルの `Prism.languages` に足される。読み込む順番は、依存する言語が先（TypeScript は JavaScript のあと）
- 読み込んでいる言語：javascript・typescript・python・sql・bash・json
