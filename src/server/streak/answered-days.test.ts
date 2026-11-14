import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import {
  answers,
  deletedAnswers,
  questions,
  subjects,
} from "@/server/db/schema";
import {
  deleteQuestion,
  deleteSubject,
  deleteTopic,
} from "@/server/manage/delete";
import { listAnsweredDays } from "./answered-days";

async function insertQuestion(
  subjectId: number,
  id: string,
  flagged = false,
  topic = "Decorators",
): Promise<number> {
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
      flagged,
    })
    .returning({ id: questions.id });
  return row.id;
}

beforeEach(async () => {
  // questions と answers は subjects を消すと一緒に消える
  await db.delete(subjects);
  await db.delete(deletedAnswers);
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

  describe("Manage で問題を消したあとも、消した問題の答えた日を数える", () => {
    let python: number;
    let decorators: number;
    let typing: number;
    let flagged: number;

    // 1/12 は Decorators、1/13 は Typing、1/14 は印の付いた問題だけに答えた。1/15 はどれにも答えていない
    beforeEach(async () => {
      const [row] = await db
        .insert(subjects)
        .values({ name: "Python" })
        .returning({ id: subjects.id });
      python = row.id;
      decorators = await insertQuestion(python, "a1");
      typing = await insertQuestion(python, "a2", false, "Typing");
      flagged = await insertQuestion(python, "a3", true);
      await db.insert(answers).values([
        {
          questionId: decorators,
          correct: true,
          answeredAt: new Date("2026-01-12T09:00:00+09:00"),
        },
        {
          questionId: typing,
          correct: false,
          answeredAt: new Date("2026-01-13T09:00:00+09:00"),
        },
        {
          questionId: flagged,
          correct: true,
          answeredAt: new Date("2026-01-14T09:00:00+09:00"),
        },
      ]);
    });

    test("Subject を消しても、答えた日は変わらない", async () => {
      await deleteSubject(python);

      expect(await listAnsweredDays()).toEqual(["2026-01-12", "2026-01-13"]);
    });

    test("Topic を消しても、答えた日は変わらない", async () => {
      await deleteTopic(python, "Typing");

      expect(await listAnsweredDays()).toEqual(["2026-01-12", "2026-01-13"]);
    });

    test("1問を消しても、答えた日は変わらない", async () => {
      await deleteQuestion(decorators);

      expect(await listAnsweredDays()).toEqual(["2026-01-12", "2026-01-13"]);
    });

    test("印の付いた問題を消しても、その答えの日は数えない", async () => {
      await deleteQuestion(flagged);

      expect(await listAnsweredDays()).toEqual(["2026-01-12", "2026-01-13"]);
    });
  });
});
