import { describe, expect, test } from "vitest";
import { missedQuestions, type Outcome, summarizeSession } from "./result";

function outcome(
  topic: string,
  kind: Outcome["outcome"],
  correctBefore = false,
): Outcome {
  return { topic, outcome: kind, correctBefore };
}

describe("summarizeSession", () => {
  test("得点と % はスキップを不正解として数え、incorrect にはスキップを含めない。% は整数に四捨五入する", () => {
    const result = summarizeSession(
      [
        ...Array.from({ length: 6 }, () => outcome("Decorators", "correct")),
        outcome("Decorators", "incorrect"),
        outcome("Decorators", "incorrect"),
        outcome("Decorators", "skipped"),
      ],
      ["Decorators"],
    );
    expect(result).toMatchObject({
      correct: 6,
      incorrect: 2,
      skipped: 1,
      total: 9,
      accuracy: 67,
    });
  });

  test("前に正解がある不正解とスキップは slipped、ない不正解とスキップは wrong。どちらも得点・%・カードでは不正解", () => {
    const result = summarizeSession(
      [
        outcome("Decorators", "correct", true),
        outcome("Decorators", "incorrect", true),
        outcome("Decorators", "skipped", true),
        outcome("Decorators", "incorrect", false),
        outcome("Decorators", "skipped", false),
      ],
      ["Decorators"],
    );
    expect(result).toMatchObject({
      correct: 1,
      incorrect: 2,
      skipped: 2,
      total: 5,
      accuracy: 20,
    });
    expect(result.topics).toEqual([
      {
        name: "Decorators",
        total: 5,
        correct: 1,
        slipped: 2,
        wrong: 2,
        accuracy: 20,
      },
    ]);
  });

  test("Topic は Setup の順に、解いた回に出た Topic だけを並べる。Setup にない Topic は最後に、出た順で置く", () => {
    const result = summarizeSession(
      [
        outcome("Async", "correct"),
        outcome("New B", "correct"),
        outcome("Decorators", "incorrect"),
        outcome("New A", "correct"),
        outcome("Async", "incorrect"),
      ],
      ["Decorators", "Generators", "Async"],
    );
    expect(result.topics.map((t) => [t.name, t.total, t.accuracy])).toEqual([
      ["Decorators", 1, 0],
      ["Async", 2, 50],
      ["New B", 1, 100],
      ["New A", 1, 100],
    ]);
  });

  test("印を付けた問題は、得点・%・数・by topic に入れず、flagged に数える", () => {
    const result = summarizeSession(
      [
        outcome("Decorators", "correct"),
        outcome("Decorators", "flagged"),
        outcome("Async", "incorrect"),
        outcome("Typing", "flagged"),
      ],
      ["Decorators", "Typing", "Async"],
    );
    expect(result).toMatchObject({
      correct: 1,
      incorrect: 1,
      skipped: 0,
      flagged: 2,
      total: 2,
      accuracy: 50,
    });
    expect(result.topics.map((t) => [t.name, t.total])).toEqual([
      ["Decorators", 1],
      ["Async", 1],
    ]);
  });

  test("数える問題が0問なら、% は null で by topic は空", () => {
    const result = summarizeSession(
      [outcome("Decorators", "flagged"), outcome("Typing", "flagged")],
      ["Decorators", "Typing"],
    );
    expect(result).toMatchObject({
      flagged: 2,
      total: 0,
      accuracy: null,
      topics: [],
    });
  });
});

describe("missedQuestions", () => {
  function reviewed(id: number, kind: Outcome["outcome"]): Outcome {
    return {
      topic: "Decorators",
      outcome: kind,
      correctBefore: false,
      review: {
        question: {
          id,
          questionId: `q${id}`,
          topic: "Decorators",
          type: "single",
          text: "問題",
          choices: ["a", "b"],
          correctBefore: false,
        },
        selected: kind === "skipped" ? [] : ["B"],
        answer: ["A"],
        explanation: "解説",
      },
    };
  }

  test("不正解と飛ばした問題だけを、解いた順で返す。正解と印を付けた問題は入れない", () => {
    const missed = missedQuestions([
      reviewed(1, "skipped"),
      reviewed(2, "correct"),
      reviewed(3, "flagged"),
      reviewed(4, "incorrect"),
      { topic: "Decorators", outcome: "flagged", correctBefore: false },
    ]);
    expect(missed.map((m) => m.review.question.id)).toEqual([1, 4]);
  });
});
