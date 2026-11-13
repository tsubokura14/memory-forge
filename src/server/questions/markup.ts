// 問題文・選択肢・解説の文字を、段落とコードブロックに分ける。データベースは使わない（画面の部品から読む）

export type Inline = { kind: "text" | "code"; text: string };

export type Block =
  | { kind: "paragraph"; inlines: Inline[] }
  | { kind: "code"; code: string; language: string };

// 行の始め（前の空白は除く）が ``` の行で、コードブロックを開け閉めする（取り込みの確かめと同じ数え方。validate.ts）。
// 開ける ``` のあとの最初の語（空白で区切る）を、言語の名前にする。閉じていないものは取り込みで止めているので来ない
export function parseMarkup(text: string): Block[] {
  const blocks: Block[] = [];
  let lines: string[] = [];
  let inCode = false;
  let language = "";

  function flush() {
    if (inCode) {
      blocks.push({ kind: "code", code: lines.join("\n"), language });
    } else {
      const paragraph = lines.join("\n").trim();
      if (paragraph !== "") {
        blocks.push({ kind: "paragraph", inlines: parseInlines(paragraph) });
      }
    }
    lines = [];
  }

  for (const line of text.split("\n")) {
    if (/^\s*```/.test(line)) {
      flush();
      inCode = !inCode;
      if (inCode) language = line.trim().slice(3).trim().split(/\s+/)[0];
    } else {
      lines.push(line);
    }
  }
  flush();
  return blocks;
}

// ` で囲んだところを、文の中のコードにする。閉じていない ` は、そのまま文字として残す
function parseInlines(text: string): Inline[] {
  const inlines: Inline[] = [];
  const pattern = /`([^`]+)`/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) {
      inlines.push({ kind: "text", text: text.slice(last, match.index) });
    }
    inlines.push({ kind: "code", text: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length)
    inlines.push({ kind: "text", text: text.slice(last) });
  return inlines;
}
