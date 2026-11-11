import { inArray } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { getSetup } from "./setup";

async function insertSubject(name: string) {
  const [row] = await db
    .insert(subjects)
    .values({ name })
    .returning({ id: subjects.id });
  return row.id;
}

async function insertQuestion(subjectId: number, id: string, topic: string) {
  const [row] = await db
    .insert(questions)
    .values({
      subjectId,
      questionId: id,
      topic,
      type: "single",
      text: "問題文",
      choices: ["A の選択肢", "B の選択肢"],
      correct: ["A"],
      explanation: "解説",
    })
    .returning({ id: questions.id });
  return row.id;
}

beforeEach(async () => {
  // questions と answers は subjects を消すと一緒に消える
  await db.delete(subjects);
});

describe("getSetup", () => {
  test("Topic を、その問題が最初に出てくる順に並べ、問題の数・解いた問題の数・最後の答えが正解の問題の数を数える", async () => {
    const python = await insertSubject("Python");
    const a = await insertQuestion(python, "a1", "Generators");
    await insertQuestion(python, "b2", "Decorators");
    const c = await insertQuestion(python, "c3", "Generators");
    // 同じ問題を2回答えても、解いた問題は1つ。最後の答えが正解なら correct に数える
    await db.insert(answers).values([
      { questionId: a, correct: false },
      { questionId: a, correct: true },
      { questionId: c, correct: false },
    ]);
    const other = await insertSubject("AWS SAA");
    await insertQuestion(other, "z9", "Decorators");

    expect(await getSetup(python)).toEqual({
      name: "Python",
      topics: [
        { name: "Generators", total: 2, answered: 2, correct: 1, flagged: 0 },
        { name: "Decorators", total: 1, answered: 0, correct: 0, flagged: 0 },
      ],
    });
  });

  test("印の付いた問題は、問題の数・解いた問題の数・正解の問題の数に入れず、印の数に数える。全部に印の Topic は0になる", async () => {
    const python = await insertSubject("Python");
    const a = await insertQuestion(python, "a1", "Typing");
    const b = await insertQuestion(python, "b2", "Typing");
    const c = await insertQuestion(python, "c3", "Typing");
    const d = await insertQuestion(python, "d4", "Decorators");
    await db.insert(answers).values([
      { questionId: a, correct: true },
      { questionId: b, correct: false },
      { questionId: d, correct: true },
    ]);
    await db
      .update(questions)
      .set({ flagged: true })
      .where(inArray(questions.id, [a, c, d]));

    expect(await getSetup(python)).toEqual({
      name: "Python",
      topics: [
        { name: "Typing", total: 1, answered: 1, correct: 0, flagged: 2 },
        { name: "Decorators", total: 0, answered: 0, correct: 0, flagged: 1 },
      ],
    });
  });

  test("ない Subject は null", async () => {
    expect(await getSetup(1)).toBeNull();
  });
});
