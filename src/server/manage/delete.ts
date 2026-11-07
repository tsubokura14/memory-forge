import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { questions, subjects } from "@/server/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// 消したあとの Subject の様子。Subject ごと消えたら、残っている Subject の id（取り込んだ順）も返す。
// 次に出す Subject を選ぶため（selection.ts の nextSubjectAfterDelete）
export type DeleteResult =
  { subjectDeleted: false } | { subjectDeleted: true; remaining: number[] };

// 問題と記録は、表の onDelete: "cascade" で一緒に消える
export async function deleteSubject(subjectId: number): Promise<DeleteResult> {
  return db.transaction(async (tx) => {
    await tx.delete(subjects).where(eq(subjects.id, subjectId));
    return { subjectDeleted: true, remaining: await remainingSubjects(tx) };
  });
}

export async function deleteTopic(
  subjectId: number,
  topic: string,
): Promise<DeleteResult> {
  return db.transaction(async (tx) => {
    await tx
      .delete(questions)
      .where(
        and(eq(questions.subjectId, subjectId), eq(questions.topic, topic)),
      );
    return deleteSubjectIfEmpty(tx, subjectId);
  });
}

// もうない問題（別のタブで消したなど）なら、何もしない
export async function deleteQuestion(id: number): Promise<DeleteResult> {
  return db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(questions)
      .where(eq(questions.id, id))
      .returning({ subjectId: questions.subjectId });
    if (!deleted) return { subjectDeleted: false };
    return deleteSubjectIfEmpty(tx, deleted.subjectId);
  });
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
