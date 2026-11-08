import { eq, min, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";

// total と answered は印のない問題だけを数え、印の付いた問題は flagged に数える
export type TopicStats = {
  name: string;
  total: number;
  answered: number;
  flagged: number;
};

export type Setup = { name: string; topics: TopicStats[] };

// Setup に出す Subject の名前と、Topic ごとの問題の数・解いた問題の数（一度でも答えた問題の数）。
// Topic は、その Topic の問題が最初に出てくる順（questions.id のいちばん小さいものの順）に並べる
export async function getSetup(subjectId: number): Promise<Setup | null> {
  const [subject] = await db
    .select({ name: subjects.name })
    .from(subjects)
    .where(eq(subjects.id, subjectId));
  if (!subject) return null;

  const topics = await db
    .select({
      name: questions.topic,
      total:
        sql<number>`count(distinct ${questions.id}) filter (where not ${questions.flagged})`.mapWith(
          Number,
        ),
      answered:
        sql<number>`count(distinct ${answers.questionId}) filter (where not ${questions.flagged})`.mapWith(
          Number,
        ),
      flagged:
        sql<number>`count(distinct ${questions.id}) filter (where ${questions.flagged})`.mapWith(
          Number,
        ),
    })
    .from(questions)
    .leftJoin(answers, eq(answers.questionId, questions.id))
    .where(eq(questions.subjectId, subjectId))
    .groupBy(questions.topic)
    .orderBy(min(questions.id));
  return { name: subject.name, topics };
}
