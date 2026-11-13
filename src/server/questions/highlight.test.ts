import { describe, expect, test } from "vitest";
import { highlight, type Segment } from "./highlight";

// 指定した文字の並びが、どの種類になったか
function kindOf(segments: Segment[], text: string) {
  const found = segments.filter((s) => s.text === text);
  expect(found, `「${text}」の切れ目`).not.toHaveLength(0);
  return found[0].kind;
}

const python = [
  "import functools",
  "",
  "@functools.wraps",
  "def logger(func):",
  "    # 呼んだことを出す",
  '    print("call")',
  "    return 42",
].join("\n");

describe("highlight", () => {
  test("Python のコードを、6つの種類と null に分ける", () => {
    const segments = highlight(python, "python");
    expect(segments.map((s) => s.text).join("")).toBe(python);
    expect(kindOf(segments, "def")).toBe("keyword");
    expect(kindOf(segments, '"call"')).toBe("string");
    expect(kindOf(segments, "logger")).toBe("function");
    expect(kindOf(segments, "print")).toBe("builtin");
    expect(kindOf(segments, "# 呼んだことを出す")).toBe("comment");
    expect(kindOf(segments, "42")).toBeNull();
  });

  test("入れ子の言葉は、内側から見て最初に当てはまった種類にする（デコレーターの中の . は decorator）", () => {
    const segments = highlight(python, "python");
    expect(kindOf(segments, "@functools")).toBe("decorator");
    expect(kindOf(segments, ".")).toBe("decorator");
  });

  test.each(["Python", "py"])(
    "言語の名前の %s も Python として色を付ける",
    (language) => {
      expect(kindOf(highlight(python, language), "def")).toBe("keyword");
    },
  );

  test.each(["css", "python3", ""])(
    "表にない言語の名前（%s）は、全体を null の1つにする",
    (language) => {
      expect(highlight(python, language)).toEqual([
        { text: python, kind: null },
      ]);
    },
  );
});
