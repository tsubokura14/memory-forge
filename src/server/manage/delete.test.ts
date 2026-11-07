import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { deleteQuestion, deleteSubject, deleteTopic } from "./delete";

async function insertSubject(name: string) {
  const [row] = await db
    .insert(subjects)
    .values({ name })
    .returning({ id: subjects.id });
  return row.id;
}

// 問題を入れ、それぞれに記録を1つ付ける。入れた問題の id を返す
async function insertQuestions(
  subjectId: number,
  items: [questionId: string, topic: string][],
) {
  const rows = await db
    .insert(questions)
    .values(
      items.map(([questionId, topic]) => ({
        subjectId,
        questionId,
        topic,
        type: "single" as const,
        text: "問題文",
        choices: ["A", "B"],
        correct: ["A"],
        explanation: "解説",
      })),
    )
    .returning({ id: questions.id });
  await db
    .insert(answers)
    .values(rows.map((row) => ({ questionId: row.id, correct: true })));
  return rows.map((row) => row.id);
}

async function questionIds() {
  const rows = await db
    .select({ id: questions.questionId })
    .from(questions)
    .orderBy(questions.id);
  return rows.map((row) => row.id);
}

async function subjectIds() {
  const rows = await db
    .select({ id: subjects.id })
    .from(subjects)
    .orderBy(subjects.id);
  return rows.map((row) => row.id);
}

async function answerCount() {
  return (await db.select().from(answers)).length;
}

let python: number;
let aws: number;
let linux: number;
let pythonQuestions: number[];

beforeEach(async () => {
  // questions と answers は subjects を消すと一緒に消える
  await db.delete(subjects);
  python = await insertSubject("Python");
  pythonQuestions = await insertQuestions(python, [
    ["p1", "Decorators"],
    ["p2", "Decorators"],
    ["p3", "Typing"],
  ]);
  aws = await insertSubject("AWS SAA");
  await insertQuestions(aws, [["a1", "IAM"]]);
  linux = await insertSubject("Linux");
  await insertQuestions(linux, [["l1", "Shell"]]);
});

describe("deleteSubject", () => {
  test("Subject の問題と記録を消し、ほかの Subject は残す", async () => {
    expect(await deleteSubject(python)).toEqual({
      subjectDeleted: true,
      remaining: [aws, linux],
    });
    expect(await subjectIds()).toEqual([aws, linux]);
    expect(await questionIds()).toEqual(["a1", "l1"]);
    expect(await answerCount()).toBe(2);
  });
});

describe("deleteTopic", () => {
  test("Topic の問題と記録を消し、ほかの Topic と Subject は残す", async () => {
    expect(await deleteTopic(python, "Decorators")).toEqual({
      subjectDeleted: false,
    });
    expect(await questionIds()).toEqual(["p3", "a1", "l1"]);
    expect(await answerCount()).toBe(3);
  });

  test("Subject の最後の Topic を消すと、Subject も消える", async () => {
    expect(await deleteTopic(aws, "IAM")).toEqual({
      subjectDeleted: true,
      remaining: [python, linux],
    });
    expect(await subjectIds()).toEqual([python, linux]);
  });
});

describe("deleteQuestion", () => {
  test("1問と記録を消し、ほかの問題は残す", async () => {
    expect(await deleteQuestion(pythonQuestions[0])).toEqual({
      subjectDeleted: false,
    });
    expect(await questionIds()).toEqual(["p2", "p3", "a1", "l1"]);
    expect(await answerCount()).toBe(4);
  });

  test("Subject の最後の1問を消すと、Subject も消える", async () => {
    const [last] = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.subjectId, linux));
    expect(await deleteQuestion(last.id)).toEqual({
      subjectDeleted: true,
      remaining: [python, aws],
    });
    expect(await subjectIds()).toEqual([python, aws]);
  });

  test("もうない問題を消しても、何も変えない", async () => {
    await deleteQuestion(pythonQuestions[0]);
    expect(await deleteQuestion(pythonQuestions[0])).toEqual({
      subjectDeleted: false,
    });
    expect(await questionIds()).toEqual(["p2", "p3", "a1", "l1"]);
  });
});
