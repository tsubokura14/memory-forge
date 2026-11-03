import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { startSession } from "./start";

let python: number;
const ids: Record<string, number> = {};

async function insertQuestion(subjectId: number, id: string, topic: string) {
  const [row] = await db
    .insert(questions)
    .values({
      subjectId,
      questionId: id,
      topic,
      type: "single",
      text: `${id} の問題文`,
      choices: ["A の選択肢", "B の選択肢"],
      correct: ["A"],
      explanation: "解説",
    })
    .returning({ id: questions.id });
  ids[id] = row.id;
}

beforeEach(async () => {
  // questions と answers は subjects を消すと一緒に消える
  await db.delete(subjects);
  [{ id: python }] = await db
    .insert(subjects)
    .values({ name: "Python" })
    .returning({ id: subjects.id });
  await insertQuestion(python, "a1", "Decorators");
  await insertQuestion(python, "b2", "Generators");
  await insertQuestion(python, "c3", "Decorators");
  const [{ id: other }] = await db
    .insert(subjects)
    .values({ name: "AWS SAA" })
    .returning({ id: subjects.id });
  await insertQuestion(other, "z9", "Decorators");
});

const questionIds = (picked: { questionId: string }[]) =>
  picked.map((q) => q.questionId);

describe("startSession", () => {
  test("Topic を選ぶと、その Subject のその Topic の問題だけを出す。正解と解説は返さない", async () => {
    const picked = await startSession(python, "Decorators", "in-order", "all");
    expect(picked).toEqual([
      {
        id: ids.a1,
        questionId: "a1",
        topic: "Decorators",
        type: "single",
        text: "a1 の問題文",
        choices: ["A の選択肢", "B の選択肢"],
        correctBefore: false,
      },
      expect.objectContaining({ questionId: "c3" }),
    ]);
  });

  test("All（null）は、その Subject の全部の Topic から出す", async () => {
    const picked = await startSession(python, null, "in-order", "all");
    expect(questionIds(picked)).toEqual(["a1", "b2", "c3"]);
  });

  test("lowest accuracy は、記録の正答率の低い順に、解いた問題だけを出す", async () => {
    await db.insert(answers).values([
      { questionId: ids.a1, correct: true },
      { questionId: ids.a1, correct: false },
      { questionId: ids.c3, correct: false },
    ]);
    const picked = await startSession(python, null, "lowest-accuracy", "all");
    expect(questionIds(picked)).toEqual(["c3", "a1"]);
  });

  test("correctBefore は、記録に一度でも正解がある問題だけ true", async () => {
    await db.insert(answers).values([
      { questionId: ids.a1, correct: false },
      { questionId: ids.a1, correct: true },
      { questionId: ids.b2, correct: false },
    ]);
    const picked = await startSession(python, null, "in-order", "all");
    expect(
      picked.map(({ questionId, correctBefore }) => [
        questionId,
        correctBefore,
      ]),
    ).toEqual([
      ["a1", true],
      ["b2", false],
      ["c3", false],
    ]);
  });
});
