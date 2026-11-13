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

  test("``` で囲んだところをコードブロックにし、字下げを残す。``` のあとの語を言語の名前にする", () => {
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
      {
        kind: "code",
        code: "def add(a, b):\n    return a + b",
        language: "python",
      },
      { kind: "paragraph", inlines: [{ kind: "text", text: "どれか。" }] },
    ]);
  });

  test("コードブロックだけの文は、コードブロック1つ。言語の名前がなければ空の文字", () => {
    expect(parseMarkup("```\nreturn wrapper\n```")).toEqual([
      { kind: "code", code: "return wrapper", language: "" },
    ]);
  });

  test("``` のあとの最初の語だけを言語の名前にする", () => {
    expect(parseMarkup("  ```python title\nx = 1\n```")).toEqual([
      { kind: "code", code: "x = 1", language: "python" },
    ]);
  });
});
