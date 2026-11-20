import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { retryQuestions } from "./retry";

let ids: number[];

beforeEach(async () => {
  // questions と answers は subjects を消すと一緒に消える
  await db.delete(subjects);
  const [subject] = await db
    .insert(subjects)
    .values({ name: "Python" })
    .returning({ id: subjects.id });
  const rows = await db
    .insert(questions)
    .values(
      ["q1", "q2", "q3", "q4"].map((questionId, i) => ({
        subjectId: subject.id,
        questionId,
        topic: "Decorators",
        type: "single" as const,
        text: `問題${i + 1}`,
        choices: ["a", "b"],
        correct: ["A"],
        explanation: "解説",
        flagged: questionId === "q4",
      })),
    )
    .returning({ id: questions.id });
  ids = rows.map((r) => r.id);
});

describe("retryQuestions", () => {
  test("渡した順のまま、解く画面の形で返す", async () => {
    const result = await retryQuestions([ids[2], ids[0]]);
    expect(result).toEqual([
      {
        id: ids[2],
        questionId: "q3",
        topic: "Decorators",
        type: "single",
        text: "問題3",
        choices: ["a", "b"],
        correctBefore: false,
      },
      expect.objectContaining({ id: ids[0], questionId: "q1" }),
    ]);
  });

  test("印の付いた問題と消えた問題は除く", async () => {
    await db.delete(questions).where(eq(questions.id, ids[1]));
    const result = await retryQuestions([ids[3], ids[1], ids[0]]);
    expect(result.map((q) => q.id)).toEqual([ids[0]]);
  });

  test("correctBefore は、その時点の記録に正解があるか", async () => {
    await db.insert(answers).values([
      { questionId: ids[0], correct: false },
      { questionId: ids[0], correct: true },
      { questionId: ids[1], correct: false },
    ]);
    const result = await retryQuestions([ids[0], ids[1]]);
    expect(result.map((q) => q.correctBefore)).toEqual([true, false]);
  });

  test("空なら空を返す", async () => {
    expect(await retryQuestions([])).toEqual([]);
  });
});
