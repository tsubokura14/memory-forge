import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { listSubjects } from "./subjects";

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

describe("listSubjects", () => {
  test("Subject を取り込んだ順に返す", async () => {
    const rows = await db
      .insert(subjects)
      .values([{ name: "Python" }, { name: "AWS SAA" }, { name: "Linux" }])
      .returning({ id: subjects.id });

    expect(await listSubjects()).toEqual([
      { id: rows[0].id, name: "Python", total: 0, answered: 0, correct: 0 },
      { id: rows[1].id, name: "AWS SAA", total: 0, answered: 0, correct: 0 },
      { id: rows[2].id, name: "Linux", total: 0, answered: 0, correct: 0 },
    ]);
  });

  test("問題ごとに最後の答えで数え、印の付いた問題は数えない", async () => {
    const [python] = await db
      .insert(subjects)
      .values({ name: "Python" })
      .returning({ id: subjects.id });
    const turnedWrong = await insertQuestion(python.id, "a1");
    const turnedCorrect = await insertQuestion(python.id, "a2");
    await insertQuestion(python.id, "a3");
    const flagged = await insertQuestion(python.id, "a4", true);
    await db.insert(answers).values([
      { questionId: turnedWrong, correct: true },
      { questionId: turnedCorrect, correct: false },
      { questionId: flagged, correct: true },
    ]);
    await db.insert(answers).values([
      { questionId: turnedWrong, correct: false },
      { questionId: turnedCorrect, correct: true },
    ]);

    expect(await listSubjects()).toEqual([
      { id: python.id, name: "Python", total: 3, answered: 2, correct: 1 },
    ]);
  });
});
