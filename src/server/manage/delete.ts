import { and, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  answers,
  deletedAnswers,
  questions,
  subjects,
} from "@/server/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// 消したあとの Subject の様子。Subject ごと消えたら、残っている Subject の id（取り込んだ順）も返す。
// 次に出す Subject を選ぶため（selection.ts の nextSubjectAfterDelete）
export type DeleteResult =
  { subjectDeleted: false } | { subjectDeleted: true; remaining: number[] };

// 問題と記録は、表の onDelete: "cascade" で一緒に消える。
// 消す前に、同じトランザクションで答えた日時を deleted_answers に写す（docs/design.md の「データ」）
export async function deleteSubject(subjectId: number): Promise<DeleteResult> {
  return db.transaction(async (tx) => {
    await keepAnsweredAt(tx, eq(questions.subjectId, subjectId));
    await tx.delete(subjects).where(eq(subjects.id, subjectId));
    return { subjectDeleted: true, remaining: await remainingSubjects(tx) };
  });
}

export async function deleteTopic(
  subjectId: number,
  topic: string,
): Promise<DeleteResult> {
  return db.transaction(async (tx) => {
    const inTopic = and(
      eq(questions.subjectId, subjectId),
      eq(questions.topic, topic),
    );
    await keepAnsweredAt(tx, inTopic);
    await tx.delete(questions).where(inTopic);
    return deleteSubjectIfEmpty(tx, subjectId);
  });
}

// もうない問題（別のタブで消したなど）なら、何もしない
export async function deleteQuestion(id: number): Promise<DeleteResult> {
  return db.transaction(async (tx) => {
    await keepAnsweredAt(tx, eq(questions.id, id));
    const [deleted] = await tx
      .delete(questions)
      .where(eq(questions.id, id))
      .returning({ subjectId: questions.subjectId });
    if (!deleted) return { subjectDeleted: false };
    return deleteSubjectIfEmpty(tx, deleted.subjectId);
  });
}

// where に当たる問題のうち、印のない問題の答えた日時を写す。
// insert().select() は、選んだ列が表の列（自動で増える id も）と同じことを求めるので、answered_at だけを入れる SQL を書く
async function keepAnsweredAt(tx: Tx, where: SQL | undefined) {
  const answered = tx
    .select({ answeredAt: answers.answeredAt })
    .from(answers)
    .innerJoin(questions, eq(questions.id, answers.questionId))
    .where(and(where, eq(questions.flagged, false)));
  await tx.execute(
    sql`insert into ${deletedAnswers} (${sql.identifier(deletedAnswers.answeredAt.name)}) ${answered}`,
  );
}

async function deleteSubjectIfEmpty(
  tx: Tx,
  subjectId: number,
): Promise<DeleteResult> {
  const [left] = await tx
    .select({ id: questions.id })
    .from(questions)
    .where(eq(questions.subjectId, subjectId))
    .limit(1);
  if (left) return { subjectDeleted: false };
  await tx.delete(subjects).where(eq(subjects.id, subjectId));
  return { subjectDeleted: true, remaining: await remainingSubjects(tx) };
}

async function remainingSubjects(tx: Tx): Promise<number[]> {
  const rows = await tx
    .select({ id: subjects.id })
    .from(subjects)
    .orderBy(subjects.id);
  return rows.map((row) => row.id);
}
