import { and, desc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { answers, questions } from "@/server/db/schema";
import { listSubjects } from "@/server/subjects/subjects";

export type ContinueSubject = { id: number; name: string; remaining: number };

// Home の「続きから」の Subject と、その Subject の「最後に間違えた問題 + まだ解いていない問題」の数。
// いちばん最近答えた Subject を選ぶ。印の付いた問題の答えは数えない（印の付いた問題は出題しないので、続きにならないため）。
// 答えがなければ一覧のいちばん上（subjects.id がいちばん小さい）。Subject がなければ null。
// 数は listSubjects と同じ数え方（lastAnswer）を使う
export async function getContinueSubject(): Promise<ContinueSubject | null> {
  const rows = await listSubjects();
  if (rows.length === 0) return null;

  const [latest] = await db
    .select({ subjectId: questions.subjectId })
    .from(answers)
    .innerJoin(
      questions,
      and(eq(questions.id, answers.questionId), eq(questions.flagged, false)),
    )
    .orderBy(desc(answers.answeredAt), desc(answers.id))
    .limit(1);

  const row = rows.find((r) => r.id === latest?.subjectId) ?? rows[0];
  return { id: row.id, name: row.name, remaining: row.total - row.correct };
}
