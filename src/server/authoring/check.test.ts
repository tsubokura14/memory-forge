import { describe, expect, test } from "vitest";
import { checkQuestionFile } from "./check";

function question(overrides: Record<string, unknown> = {}) {
  return {
    id: "k3f9a2",
    topic: "Decorators",
    type: "single",
    text: "出力されるものはどれか。",
    choices: ["call add", "add", "None"],
    correct: ["C"],
    explanation: "デコレータは関数を返す。",
    ...overrides,
  };
}

function file(questions: unknown[], subject = "Python") {
  return JSON.stringify({ subject, questions });
}

const target = {
  path: "/q/python-decorators.json",
  name: "python-decorators.json",
};

describe("checkQuestionFile", () => {
  test("誤りがなければ、Subject と問題数を出す", () => {
    const result = checkQuestionFile(
      { ...target, content: file([question(), question({ id: "b2c4d6" })]) },
      [],
    );
    expect(result).toEqual({
      ok: true,
      lines: ["python-decorators.json：誤りはありません（Python・2問）。"],
    });
  });

  test("Import の確かめの誤りを、見出しと ID・項目・内容の行にする", () => {
    const result = checkQuestionFile(
      {
        ...target,
        content: file([
          question({ correct: ["E"] }),
          question({ id: "b2c4d6", text: "" }),
        ]),
      },
      [],
    );
    expect(result).toEqual({
      ok: false,
      lines: [
        "python-decorators.json：2 件の不備があります。",
        "  k3f9a2  correct  選択肢にありません（E）。",
        "  b2c4d6  text  ありません。",
      ],
    });
  });

  test("同じ Subject のほかのファイルと ID が重なると、id の誤りになる", () => {
    const result = checkQuestionFile(
      { ...target, content: file([question(), question({ id: "b2c4d6" })]) },
      [
        {
          path: "/q/python.json",
          name: "python.json",
          content: file([question()]),
        },
        {
          path: "/q/aws.json",
          name: "aws.json",
          content: file([question({ id: "b2c4d6" })], "AWS"),
        },
      ],
    );
    expect(result).toEqual({
      ok: false,
      lines: [
        "python-decorators.json：1 件の不備があります。",
        "  k3f9a2  id  ほかのファイル（python.json）と ID が重なっています。",
      ],
    });
  });

  test("ファイルそのものに誤りがあるときは、ほかのファイルとの重なりを見ない", () => {
    const result = checkQuestionFile(
      { ...target, content: file([question({ correct: ["E"] })]) },
      [
        {
          path: "/q/python.json",
          name: "python.json",
          content: file([question()]),
        },
      ],
    );
    expect(result.lines).toEqual([
      "python-decorators.json：1 件の不備があります。",
      "  k3f9a2  correct  選択肢にありません（E）。",
    ]);
  });

  test("ファイルを読めないときは、誤りにする", () => {
    expect(checkQuestionFile({ ...target, content: null }, [])).toEqual({
      ok: false,
      lines: ["python-decorators.json：ファイルを読めません。"],
    });
  });
});
