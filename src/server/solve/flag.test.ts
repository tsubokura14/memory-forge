import { beforeEach, describe, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { flagQuestion, unflagQuestion } from "./flag";

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
      type: "single",
      text: "問題文",
      choices: ["A の選択肢", "B の選択肢"],
      correct: ["A"],
      explanation: "解説",
    })
    .returning({ id: questions.id });
  questionId = question.id;
  await db.insert(answers).values({ questionId, correct: true });
});

async function flagged() {
  const [row] = await db
    .select({ flagged: questions.flagged })
    .from(questions)
    .where(eq(questions.id, questionId));
  return row.flagged;
}

async function recordCount() {
  return (await db.select().from(answers)).length;
}

describe("flagQuestion", () => {
  test("印を付ける。記録は変わらない。もう付いていても成功する", async () => {
    await flagQuestion(questionId);
    expect(await flagged()).toBe(true);
    await flagQuestion(questionId);
    expect(await flagged()).toBe(true);
    expect(await recordCount()).toBe(1);
  });

  test("問題が消えていたら失敗する", async () => {
    await db.delete(questions);
    await expect(flagQuestion(questionId)).rejects.toThrow();
  });
});

describe("unflagQuestion", () => {
  test("印を外す。記録は変わらない。もう外れていても成功する", async () => {
    await flagQuestion(questionId);
    await unflagQuestion(questionId);
    expect(await flagged()).toBe(false);
    await unflagQuestion(questionId);
    expect(await flagged()).toBe(false);
    expect(await recordCount()).toBe(1);
  });

  test("問題が消えていたら失敗する", async () => {
    await db.delete(questions);
    await expect(unflagQuestion(questionId)).rejects.toThrow();
  });
});
