import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { listAnsweredDays } from "./answered-days";

async function insertQuestion(
  subjectId: number,
  id: string,
  flagged = false,
): Promise<number> {
  const [row] = await db
    .insert(questions)
    .values({
      subjectId,
      questionId: id,
      topic: "Decorators",
      type: "single",
      text: "問題文",
      choices: ["A の選択肢", "B の選択肢"],
      correct: ["A"],
      explanation: "解説",
      flagged,
    })
    .returning({ id: questions.id });
  return row.id;
}

beforeEach(async () => {
  // questions と answers は subjects を消すと一緒に消える
  await db.delete(subjects);
});

describe("listAnsweredDays", () => {
  test("答えた日を日本時間の日付で、重ねずに古い順に返す。不正解（スキップ）も数え、印の付いた問題の答えは数えない", async () => {
    const [python] = await db
      .insert(subjects)
      .values({ name: "Python" })
      .returning({ id: subjects.id });
    const question = await insertQuestion(python.id, "a1");
    const flagged = await insertQuestion(python.id, "a2", true);
    await db.insert(answers).values([
      // 日本時間の0時の前後で別の日
      {
        questionId: question,
        correct: true,
        answeredAt: new Date("2026-01-14T23:59:59+09:00"),
      },
      {
        questionId: question,
        correct: true,
        answeredAt: new Date("2026-01-15T00:00:00+09:00"),
      },
      // 同じ日の答えは1日にまとめる
      {
        questionId: question,
        correct: true,
        answeredAt: new Date("2026-01-15T21:00:00+09:00"),
      },
      // 不正解（スキップも不正解として記録される）
      {
        questionId: question,
        correct: false,
        answeredAt: new Date("2026-01-12T09:00:00+09:00"),
      },
      // 印の付いた問題の答え
      {
        questionId: flagged,
        correct: true,
        answeredAt: new Date("2026-01-13T09:00:00+09:00"),
      },
    ]);

    expect(await listAnsweredDays()).toEqual([
      "2026-01-12",
      "2026-01-14",
      "2026-01-15",
    ]);
  });
});
