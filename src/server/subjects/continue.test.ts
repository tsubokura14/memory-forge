import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { getContinueSubject } from "./continue";

async function insertSubject(name: string): Promise<number> {
  const [row] = await db
    .insert(subjects)
    .values({ name })
    .returning({ id: subjects.id });
  return row.id;
}

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

describe("getContinueSubject", () => {
  test("Subject がなければ null", async () => {
    expect(await getContinueSubject()).toBeNull();
  });

  test("答えがなければ、いちばん上（subjects.id がいちばん小さい）の Subject", async () => {
    const python = await insertSubject("Python");
    await insertSubject("Linux");
    await insertQuestion(python, "a1");
    await insertQuestion(python, "a2");

    expect(await getContinueSubject()).toEqual({
      id: python,
      name: "Python",
      remaining: 2,
    });
  });

  test("いちばん最近答えた Subject を返し、印の付いた問題の答えは数えない", async () => {
    const python = await insertSubject("Python");
    const linux = await insertSubject("Linux");
    const aws = await insertSubject("AWS SAA");
    const p1 = await insertQuestion(python, "p1");
    const l1 = await insertQuestion(linux, "l1");
    const a1 = await insertQuestion(aws, "a1", true);
    await db.insert(answers).values([
      {
        questionId: p1,
        correct: true,
        answeredAt: new Date("2026-11-10T00:00:00Z"),
      },
      {
        questionId: l1,
        correct: true,
        answeredAt: new Date("2026-11-12T00:00:00Z"),
      },
      {
        questionId: a1,
        correct: true,
        answeredAt: new Date("2026-11-15T00:00:00Z"),
      },
    ]);

    expect(await getContinueSubject()).toMatchObject({
      id: linux,
      name: "Linux",
    });
  });

  test("N は最後に間違えた問題とまだ解いていない問題の数で、印の付いた問題は数えない", async () => {
    const python = await insertSubject("Python");
    const turnedWrong = await insertQuestion(python, "a1");
    const turnedCorrect = await insertQuestion(python, "a2");
    await insertQuestion(python, "a3");
    await insertQuestion(python, "a4", true);
    await db.insert(answers).values([
      { questionId: turnedWrong, correct: true },
      { questionId: turnedCorrect, correct: false },
    ]);
    await db.insert(answers).values([
      { questionId: turnedWrong, correct: false },
      { questionId: turnedCorrect, correct: true },
    ]);

    expect(await getContinueSubject()).toEqual({
      id: python,
      name: "Python",
      remaining: 2,
    });
  });
});
