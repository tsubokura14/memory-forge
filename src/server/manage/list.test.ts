import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { getManage } from "./list";

async function insertSubject(name: string) {
  const [row] = await db
    .insert(subjects)
    .values({ name })
    .returning({ id: subjects.id });
  return row.id;
}

async function insertQuestion(
  subjectId: number,
  id: string,
  topic: string,
  type: "single" | "multiple" = "single",
) {
  const [row] = await db
    .insert(questions)
    .values({
      subjectId,
      questionId: id,
      topic,
      type,
      text: `${id} の問題文`,
      choices: ["A の選択肢", "B の選択肢"],
      correct: type === "single" ? ["A"] : ["A", "B"],
      explanation: "解説",
    })
    .returning({ id: questions.id });
  return row.id;
}

async function flag(id: number) {
  await db.update(questions).set({ flagged: true }).where(eq(questions.id, id));
}

beforeEach(async () => {
  // questions と answers は subjects を消すと一緒に消える
  await db.delete(subjects);
});

describe("getManage", () => {
  test("Subject を取り込んだ順に、Topic を問題が最初に出てくる順に、問題数つきで並べる", async () => {
    const python = await insertSubject("Python");
    await insertQuestion(python, "a1", "Generators");
    await insertQuestion(python, "b2", "Decorators");
    await insertQuestion(python, "c3", "Generators");
    const aws = await insertSubject("AWS SAA");
    await insertQuestion(aws, "z9", "IAM");

    const manage = await getManage(null);
    expect(manage.subjects).toEqual([
      { id: python, name: "Python", count: 3, flagged: 0 },
      { id: aws, name: "AWS SAA", count: 1, flagged: 0 },
    ]);
    expect(manage.selected).toMatchObject({
      subjectId: python,
      topic: null,
      page: 1,
      lastPage: 1,
      total: 3,
      topics: [
        { name: "Generators", count: 2 },
        { name: "Decorators", count: 1 },
      ],
    });
    expect(manage.selected?.questions.map((q) => q.questionId)).toEqual([
      "a1",
      "b2",
      "c3",
    ]);
  });

  test("Topic を選ぶと、その Topic の問題だけを取り込んだ順に並べる", async () => {
    const python = await insertSubject("Python");
    await insertQuestion(python, "a1", "Generators");
    await insertQuestion(python, "b2", "Decorators");
    await insertQuestion(python, "c3", "Generators");

    const manage = await getManage({
      subjectId: python,
      topic: "Generators",
      page: 1,
      flagged: false,
    });
    expect(manage.selected?.total).toBe(2);
    expect(manage.selected?.questions.map((q) => q.questionId)).toEqual([
      "a1",
      "c3",
    ]);
  });

  test("問題ごとに、種類・問題文・正答率（四捨五入）・解いた回数を出す。解いていない問題は正答率なし", async () => {
    const python = await insertSubject("Python");
    const a = await insertQuestion(python, "a1", "Generators", "multiple");
    await insertQuestion(python, "b2", "Generators");
    await db.insert(answers).values([
      { questionId: a, correct: true },
      { questionId: a, correct: true },
      { questionId: a, correct: false },
    ]);

    const manage = await getManage(null);
    expect(manage.selected?.questions).toEqual([
      {
        id: a,
        questionId: "a1",
        topic: "Generators",
        type: "multiple",
        text: "a1 の問題文",
        accuracy: 67,
        tries: 3,
        flagged: false,
      },
      expect.objectContaining({ questionId: "b2", accuracy: null, tries: 0 }),
    ]);
  });

  test("2ページ目は、51問目から出す", async () => {
    const python = await insertSubject("Python");
    // 1問ずつ入れると遅いので、まとめて入れる
    await db.insert(questions).values(
      Array.from({ length: 51 }, (_, i) => ({
        subjectId: python,
        questionId: `q${i + 1}`,
        topic: "Basics",
        type: "single" as const,
        text: "問題文",
        choices: ["A の選択肢", "B の選択肢"],
        correct: ["A"],
        explanation: "解説",
      })),
    );

    const manage = await getManage({
      subjectId: python,
      topic: null,
      page: 2,
      flagged: false,
    });
    expect(manage.selected).toMatchObject({ page: 2, lastPage: 2, total: 51 });
    expect(manage.selected?.questions.map((q) => q.questionId)).toEqual([
      "q51",
    ]);
  });

  test("Subject と Topic に印の数を出し、問題の行に印の有無を出す", async () => {
    const python = await insertSubject("Python");
    await flag(await insertQuestion(python, "a1", "Generators"));
    await insertQuestion(python, "b2", "Decorators");
    await flag(await insertQuestion(python, "c3", "Generators"));
    const aws = await insertSubject("AWS SAA");
    await insertQuestion(aws, "z9", "IAM");

    const manage = await getManage(null);
    expect(manage.subjects).toEqual([
      { id: python, name: "Python", count: 3, flagged: 2 },
      { id: aws, name: "AWS SAA", count: 1, flagged: 0 },
    ]);
    expect(manage.selected?.topics).toEqual([
      { name: "Generators", count: 2, flagged: 2 },
      { name: "Decorators", count: 1, flagged: 0 },
    ]);
    expect(manage.selected?.questions.map((q) => q.flagged)).toEqual([
      true,
      false,
      true,
    ]);
  });

  test("flagged のときは、印の付いた問題だけを取り込んだ順に出し、Topic はそのまま並べる", async () => {
    const python = await insertSubject("Python");
    await flag(await insertQuestion(python, "a1", "Generators"));
    await insertQuestion(python, "b2", "Decorators");
    await flag(await insertQuestion(python, "c3", "Decorators"));

    const manage = await getManage({
      subjectId: python,
      topic: null,
      page: 1,
      flagged: true,
    });
    expect(manage.selected).toMatchObject({ flagged: true, total: 2 });
    expect(manage.selected?.questions.map((q) => q.questionId)).toEqual([
      "a1",
      "c3",
    ]);
    expect(manage.selected?.topics.map((t) => t.name)).toEqual([
      "Generators",
      "Decorators",
    ]);
  });

  test("flagged と Topic を組み合わせる。その Topic に印がなければ0件", async () => {
    const python = await insertSubject("Python");
    await flag(await insertQuestion(python, "a1", "Generators"));
    await insertQuestion(python, "b2", "Generators");
    await insertQuestion(python, "c3", "Decorators");

    const generators = await getManage({
      subjectId: python,
      topic: "Generators",
      page: 1,
      flagged: true,
    });
    expect(generators.selected?.total).toBe(1);
    expect(generators.selected?.questions.map((q) => q.questionId)).toEqual([
      "a1",
    ]);

    const decorators = await getManage({
      subjectId: python,
      topic: "Decorators",
      page: 1,
      flagged: true,
    });
    expect(decorators.selected).toMatchObject({
      topic: "Decorators",
      flagged: true,
      total: 0,
      page: 1,
      lastPage: 1,
      questions: [],
    });
  });

  test("flagged の2ページ目は、印の付いた問題の51問目から出す", async () => {
    const python = await insertSubject("Python");
    await insertQuestion(python, "plain", "Basics");
    await db.insert(questions).values(
      Array.from({ length: 51 }, (_, i) => ({
        subjectId: python,
        questionId: `q${i + 1}`,
        topic: "Basics",
        type: "single" as const,
        text: "問題文",
        choices: ["A の選択肢", "B の選択肢"],
        correct: ["A"],
        explanation: "解説",
        flagged: true,
      })),
    );

    const manage = await getManage({
      subjectId: python,
      topic: null,
      page: 2,
      flagged: true,
    });
    expect(manage.selected).toMatchObject({ page: 2, lastPage: 2, total: 51 });
    expect(manage.selected?.questions.map((q) => q.questionId)).toEqual([
      "q51",
    ]);
  });

  test("Subject が0件なら、選んでいるものはない", async () => {
    expect(await getManage(null)).toEqual({ subjects: [], selected: null });
  });
});
