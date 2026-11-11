import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { questions, subjects } from "@/server/db/schema";
import { lastAnswer } from "@/server/mastery/last-answer";
import type { MasteryCounts } from "@/server/mastery/mastery";

export type SubjectRow = { id: number; name: string } & MasteryCounts;

// Home の一覧。取り込んだ順（subjects.id の順）に、印のない問題の数・解いた問題の数・最後の答えが正解の問題の数を返す
export async function listSubjects(): Promise<SubjectRow[]> {
  return db
    .select({
      id: subjects.id,
      name: subjects.name,
      total: sql<number>`count(${questions.id})`.mapWith(Number),
      answered: sql<number>`count(${lastAnswer.questionId})`.mapWith(Number),
      correct:
        sql<number>`count(${lastAnswer.questionId}) filter (where ${lastAnswer.correct})`.mapWith(
          Number,
        ),
    })
    .from(subjects)
    .leftJoin(
      questions,
      and(eq(questions.subjectId, subjects.id), eq(questions.flagged, false)),
    )
    .leftJoin(lastAnswer, eq(lastAnswer.questionId, questions.id))
    .groupBy(subjects.id)
    .orderBy(subjects.id);
}
