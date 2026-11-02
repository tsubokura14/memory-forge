// 問題文・選択肢・解説の文字を、段落とコードブロックに分ける。データベースは使わない（画面の部品から読む）

export type Inline = { kind: "text" | "code"; text: string };

export type Block =
  { kind: "paragraph"; inlines: Inline[] } | { kind: "code"; code: string };

// 行の始め（前の空白は除く）が ``` の行で、コードブロックを開け閉めする（取り込みの確かめと同じ数え方。validate.ts）。
// ``` のあとの言語の名前は、コードの色付け（#7）で使うまで読み捨てる。閉じていないものは取り込みで止めているので来ない
export function parseMarkup(text: string): Block[] {
  const blocks: Block[] = [];
  let lines: string[] = [];
  let inCode = false;

  function flush() {
    if (inCode) {
      blocks.push({ kind: "code", code: lines.join("\n") });
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
