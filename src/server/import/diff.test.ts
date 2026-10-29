import { describe, expect, test } from "vitest";
import { diffQuestions } from "./diff";
import type { FileQuestion } from "./validate";

function question(overrides: Partial<FileQuestion> = {}): FileQuestion {
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

describe("diffQuestions", () => {
  test("同じ ID がなければ増える、中身がすべて同じなら変わらない", () => {
    const stored = [question({ id: "a1" })];
    const result = diffQuestions(
      [question({ id: "a1" }), question({ id: "b2" })],
      stored,
    );
    expect(result.added.map((q) => q.id)).toEqual(["b2"]);
    expect(result.replaced).toEqual([]);
    expect(result.unchanged.map((q) => q.id)).toEqual(["a1"]);
  });

  test("中身が違えば置き換わり、変わった項目ごとに前と後を出す", () => {
    const before = question({ explanation: "古い解説" });
    const after = question({
      explanation: "新しい解説",
      type: "multiple",
      correct: ["A", "C"],
    });
    expect(diffQuestions([after], [before]).replaced).toEqual([
      {
        question: after,
        changes: [
          { item: "type", before: "single", after: "multiple" },
          { item: "correct", before: "C", after: "A, C" },
          { item: "explanation", before: "古い解説", after: "新しい解説" },
        ],
      },
    ]);
  });

  test("Topic だけが違う問題も、置き換わる", () => {
    const after = question({ topic: "Generators" });
    expect(diffQuestions([after], [question()]).replaced).toEqual([
      {
        question: after,
        changes: [{ item: "topic", before: "Decorators", after: "Generators" }],
      },
    ]);
  });

  test("選択肢の数が変わったときは、ない側を空にして出す", () => {
    const after = question({ choices: ["call add", "add", "None", "Error"] });
    expect(diffQuestions([after], [question()]).replaced).toEqual([
      {
        question: after,
        changes: [{ item: "choice D", before: "", after: "Error" }],
      },
    ]);
  });
});
