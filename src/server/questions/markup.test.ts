import { describe, expect, test } from "vitest";
import { parseMarkup } from "./markup";

describe("parseMarkup", () => {
  test("コードのない文は、段落1つ", () => {
    expect(parseMarkup("ラッパーの実行が速くなる。")).toEqual([
      {
        kind: "paragraph",
        inlines: [{ kind: "text", text: "ラッパーの実行が速くなる。" }],
      },
    ]);
  });

  test("` で囲んだところを、文の中のコードにする", () => {
    expect(parseMarkup("`functools.wraps` について選べ。")).toEqual([
      {
        kind: "paragraph",
        inlines: [
          { kind: "code", text: "functools.wraps" },
          { kind: "text", text: " について選べ。" },
        ],
      },
    ]);
  });

  test("閉じていない ` は、そのまま文字として出す", () => {
    expect(parseMarkup("a ` b")).toEqual([
      { kind: "paragraph", inlines: [{ kind: "text", text: "a ` b" }] },
    ]);
  });

  test("``` で囲んだところをコードブロックにし、字下げを残す。言語の名前は読み捨てる", () => {
    const text = [
      "次のコードを実行したとき、出力されるものはどれか。",
      "```python",
      "def add(a, b):",
      "    return a + b",
      "```",
      "どれか。",
    ].join("\n");
    expect(parseMarkup(text)).toEqual([
      {
        kind: "paragraph",
        inlines: [
          {
            kind: "text",
            text: "次のコードを実行したとき、出力されるものはどれか。",
          },
        ],
      },
      { kind: "code", code: "def add(a, b):\n    return a + b" },
      { kind: "paragraph", inlines: [{ kind: "text", text: "どれか。" }] },
    ]);
  });

  test("コードブロックだけの文は、コードブロック1つ", () => {
    expect(parseMarkup("```\nreturn wrapper\n```")).toEqual([
      { kind: "code", code: "return wrapper" },
    ]);
  });
});
