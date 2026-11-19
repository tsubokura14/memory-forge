import { describe, expect, test } from "vitest";
import {
  countProblems,
  MAX_FILE_BYTES,
  validateQuestionFile,
} from "./validate";

function question(overrides: Record<string, unknown> = {}) {
  return {
    id: "k3f9a2",
    topic: "Decorators",
    type: "single",
    text: "次のコードを実行したとき、出力されるものはどれか。",
    choices: ["call add", "add", "None"],
    correct: ["C"],
    explanation: "デコレータは関数を返す。",
    ...overrides,
  };
}

function file(questions: unknown[], subject: unknown = "Python") {
  return JSON.stringify({ subject, questions });
}

function errorsOf(content: string) {
  const result = validateQuestionFile(content);
  if (result.ok) throw new Error("誤りがあるはずが、通った");
  return result.errors;
}

describe("validateQuestionFile", () => {
  test("誤りがなければ、Subject と問題を書かれたまま返す", () => {
    const text = "  字下げ\n```python\nprint(1)\n```";
    const result = validateQuestionFile(file([question({ text })]));
    expect(result).toEqual({
      ok: true,
      file: { subject: "Python", questions: [question({ text })] },
    });
  });

  test("JSON として読めないと、ファイル全体の誤りになる", () => {
    expect(errorsOf("{ subject:")).toEqual([
      { id: "—", item: "file", message: "JSON として読めません。" },
    ]);
  });

  test("4MB ちょうどは通り、それより大きいと誤りになる", () => {
    const base = file([question()]);
    // 大きさは文字の数ではなく、UTF-8 のバイト数で数える
    const exact =
      base + " ".repeat(MAX_FILE_BYTES - Buffer.byteLength(base, "utf8"));
    expect(validateQuestionFile(exact).ok).toBe(true);
    expect(errorsOf(exact + " ")).toEqual([
      { id: "—", item: "file", message: "大きすぎます。4 MB までです。" },
    ]);
  });

  test("問題は1,000問まで通り、それより多いと誤りになる", () => {
    const many = (n: number) =>
      Array.from({ length: n }, (_, i) => question({ id: `q${i}` }));
    expect(validateQuestionFile(file(many(1000))).ok).toBe(true);
    expect(errorsOf(file(many(1001)))).toEqual([
      {
        id: "—",
        item: "questions",
        message: "問題が多すぎます（1,001問）。1,000問までです。",
      },
    ]);
  });

  test("問題が0問だと誤りになる", () => {
    expect(errorsOf(file([]))).toEqual([
      { id: "—", item: "questions", message: "問題が1つもありません。" },
    ]);
  });

  test("Subject がない・1つの文字でないと誤りになる", () => {
    expect(errorsOf(file([question()], " "))).toEqual([
      { id: "—", item: "subject", message: "ありません。" },
    ]);
    expect(errorsOf(file([question()], ["Python", "Rust"]))).toEqual([
      { id: "—", item: "subject", message: "形が違います。" },
    ]);
  });

  test("項目がない・空白だけ・文字でないと誤りになる", () => {
    const noExplanation: Record<string, unknown> = question();
    delete noExplanation.explanation;
    expect(errorsOf(file([noExplanation]))).toEqual([
      { id: "k3f9a2", item: "explanation", message: "ありません。" },
    ]);
    expect(errorsOf(file([question({ topic: "  \n" })]))).toEqual([
      { id: "k3f9a2", item: "topic", message: "ありません。" },
    ]);
    expect(errorsOf(file([question({ text: 42 })]))).toEqual([
      { id: "k3f9a2", item: "text", message: "形が違います。" },
    ]);
  });

  test("ID がない問題は、何問目かで示す", () => {
    expect(
      errorsOf(file([question({ id: "a1" }), question({ id: "" })])),
    ).toEqual([{ id: "#2", item: "id", message: "ありません。" }]);
  });

  test("種類が single・multiple でないと誤りになる", () => {
    expect(errorsOf(file([question({ type: "multi" })]))).toEqual([
      {
        id: "k3f9a2",
        item: "type",
        message: "single か multiple にしてください。",
      },
    ]);
  });

  test("選択肢は2〜8つまで通り、外れると誤りになる", () => {
    const choices = (n: number) =>
      Array.from({ length: n }, (_, i) => `choice ${i}`);
    for (const n of [2, 8]) {
      expect(
        validateQuestionFile(
          file([question({ choices: choices(n), correct: ["A"] })]),
        ).ok,
      ).toBe(true);
    }
    for (const n of [1, 9]) {
      expect(
        errorsOf(file([question({ choices: choices(n), correct: ["A"] })])),
      ).toEqual([
        {
          id: "k3f9a2",
          item: "choices",
          message: "選択肢は2〜8個にしてください。",
        },
      ]);
    }
  });

  test("選択肢が空の並びだと、ないのと同じ誤りになる", () => {
    expect(errorsOf(file([question({ choices: [] })]))).toEqual([
      { id: "k3f9a2", item: "choices", message: "ありません。" },
    ]);
  });

  test("正解に同じ記号が2回あると、形の誤りになる", () => {
    expect(
      errorsOf(file([question({ type: "multiple", correct: ["A", "A"] })])),
    ).toEqual([{ id: "k3f9a2", item: "correct", message: "形が違います。" }]);
  });

  test("空の選択肢は、その記号で示す", () => {
    expect(errorsOf(file([question({ choices: ["a", "", "c"] })]))).toEqual([
      { id: "k3f9a2", item: "choice B", message: "ありません。" },
    ]);
  });

  test("正解が選択肢の中にないと誤りになる", () => {
    expect(errorsOf(file([question({ correct: ["E"] })]))).toEqual([
      { id: "k3f9a2", item: "correct", message: "選択肢にありません（E）。" },
    ]);
  });

  test("単一選択は正解がちょうど1つ、複数選択は2つ以上で通る", () => {
    expect(errorsOf(file([question({ correct: ["A", "B"] })]))).toEqual([
      {
        id: "k3f9a2",
        item: "correct",
        message: "1つを選ぶ問題は、正解が1つだけ要ります。",
      },
    ]);
    expect(
      errorsOf(file([question({ type: "multiple", correct: ["A"] })])),
    ).toEqual([
      {
        id: "k3f9a2",
        item: "correct",
        message: "すべて選ぶ問題は、正解が2つ以上要ります。",
      },
    ]);
    expect(
      validateQuestionFile(
        file([question({ type: "multiple", correct: ["A", "C"] })]),
      ).ok,
    ).toBe(true);
  });

  test("コードブロックが閉じていないと、その項目の誤りになる", () => {
    const open = "前の文\n```python\nprint(1)";
    expect(
      errorsOf(
        file([
          question({
            text: open,
            choices: ["a", open, "c"],
            explanation: open,
          }),
        ]),
      ),
    ).toEqual([
      {
        id: "k3f9a2",
        item: "text",
        message: "コードブロックが閉じていません（```）。",
      },
      {
        id: "k3f9a2",
        item: "choice B",
        message: "コードブロックが閉じていません（```）。",
      },
      {
        id: "k3f9a2",
        item: "explanation",
        message: "コードブロックが閉じていません（```）。",
      },
    ]);
  });

  test("ファイルの中で ID が重なると、重なった数を出す", () => {
    expect(
      errorsOf(
        file([
          question({ id: "a1" }),
          question({ id: "b2" }),
          question({ id: "a1" }),
        ]),
      ),
    ).toEqual([
      { id: "a1", item: "id", message: "ID が重なっています（2問）。" },
    ]);
  });

  test("誤りは、問題の順に全部を返す", () => {
    expect(
      errorsOf(
        file([
          question({ id: "p81xq0", type: "multiple", correct: ["A"] }),
          question({ id: "m2v7c4", explanation: "" }),
        ]),
      ),
    ).toEqual([
      {
        id: "p81xq0",
        item: "correct",
        message: "すべて選ぶ問題は、正解が2つ以上要ります。",
      },
      { id: "m2v7c4", item: "explanation", message: "ありません。" },
    ]);
  });
});

describe("countProblems", () => {
  test("誤りの数を「N 件の不備」で数える", () => {
    expect(countProblems(1)).toBe("1 件の不備");
    expect(countProblems(2)).toBe("2 件の不備");
  });
});
