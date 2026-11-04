import { and, count, eq, min, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { lastPage, PAGE_SIZE } from "./pages";
import { resolveSelection, type Saved, type Selection } from "./selection";

export type ManageQuestion = {
  id: number;
  questionId: string;
  topic: string;
  type: "single" | "multiple";
  text: string;
  // 正解の割合（%、整数に四捨五入）。まだ解いていなければ null
  accuracy: number | null;
  tries: number;
};

export type Manage = {
  subjects: { id: number; name: string; count: number }[];
  selected:
    | (Selection & {
        lastPage: number;
        topics: { name: string; count: number }[];
        questions: ManageQuestion[];
      })
    | null;
};

// Manage の一覧に出すもの。Subject は取り込んだ順（subjects.id の順）、Topic は Setup と同じ順
// （その Topic の問題が最初に出てくる順。src/server/solve/setup.ts）に、問題数つきで並べる。
// 問題は、選んだ Topic（null なら Subject の全部）のうち、今のページの50問を取り込んだ順（questions.id の順）に返す
export async function getManage(saved: Saved | null): Promise<Manage> {
  // 問題のない Subject は、消す操作の中で一緒に消すので来ない。来ても一覧には出さない
  const rows = await db
    .select({
      subjectId: subjects.id,
      subjectName: subjects.name,
      topic: questions.topic,
      count: count(questions.id),
    })
    .from(subjects)
    .innerJoin(questions, eq(questions.subjectId, subjects.id))
    .groupBy(subjects.id, questions.topic)
    .orderBy(subjects.id, min(questions.id));

  const grouped: {
    id: number;
    name: string;
    topics: { name: string; count: number }[];
  }[] = [];
  for (const row of rows) {
    let subject = grouped.at(-1);
    if (subject?.id !== row.subjectId) {
      subject = { id: row.subjectId, name: row.subjectName, topics: [] };
      grouped.push(subject);
    }
    subject.topics.push({ name: row.topic, count: row.count });
  }

  const list = grouped.map((s) => ({
    id: s.id,
    name: s.name,
    count: s.topics.reduce((sum, t) => sum + t.count, 0),
  }));
  const selection = resolveSelection(saved, grouped);
  if (!selection) return { subjects: list, selected: null };

  const topics = grouped.find((s) => s.id === selection.subjectId)!.topics;
  const page = await db
    .select({
      id: questions.id,
      questionId: questions.questionId,
      topic: questions.topic,
      type: questions.type,
      text: questions.text,
      tries: count(answers.id),
      correct: sql<number>`count(*) filter (where ${answers.correct})`.mapWith(
        Number,
      ),
    })
    .from(questions)
    .leftJoin(answers, eq(answers.questionId, questions.id))
    .where(
      and(
        eq(questions.subjectId, selection.subjectId),
        selection.topic === null
          ? undefined
          : eq(questions.topic, selection.topic),
      ),
    )
    .groupBy(questions.id)
    .orderBy(questions.id)
    .limit(PAGE_SIZE)
    .offset((selection.page - 1) * PAGE_SIZE);

  return {
    subjects: list,
    selected: {
      ...selection,
      lastPage: lastPage(selection.total),
      topics,
      questions: page.map(({ correct, ...q }) => ({
        ...q,
        accuracy: q.tries === 0 ? null : Math.round((correct / q.tries) * 100),
      })),
    },
  };
}
