import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { answerQuestion, skipQuestion } from "./answer";

let questionId: number;

beforeEach(async () => {
  // questions と answers は subjects を消すと一緒に消える
  await db.delete(subjects);
  const [subject] = await db
    .insert(subjects)
    .values({ name: "Python" })
    .returning({ id: subjects.id });
  const [question] = await db
    .insert(questions)
    .values({
      subjectId: subject.id,
      questionId: "k3f9a2",
      topic: "Decorators",
      type: "multiple",
      text: "当てはまるものをすべて選べ。",
      choices: ["add", "wrapper", "logger", "None"],
      correct: ["A", "C"],
      explanation: "デコレータは関数を返す。",
    })
    .returning({ id: questions.id });
  questionId = question.id;
});

async function recorded() {
  return db
    .select({ correct: answers.correct })
    .from(answers)
    .where(eq(answers.questionId, questionId));
}

describe("answerQuestion", () => {
  test("正解を記録し、正解の記号と解説を返す", async () => {
    expect(await answerQuestion(questionId, ["C", "A"])).toEqual({
      correct: true,
      answer: ["A", "C"],
      explanation: "デコレータは関数を返す。",
    });
    expect(await recorded()).toEqual([{ correct: true }]);
  });

  test("不正解を記録する", async () => {
    expect(await answerQuestion(questionId, ["A"])).toMatchObject({
      correct: false,
    });
    expect(await recorded()).toEqual([{ correct: false }]);
  });

  test("問題が消えていたら失敗し、何も記録しない", async () => {
    await db.delete(questions);
    await expect(answerQuestion(questionId, ["A"])).rejects.toThrow();
    expect(await db.select().from(answers)).toEqual([]);
  });
});

describe("skipQuestion", () => {
  test("不正解として記録する", async () => {
    await skipQuestion(questionId);
    expect(await recorded()).toEqual([{ correct: false }]);
  });
});
