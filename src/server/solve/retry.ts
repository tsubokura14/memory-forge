import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { answers, questions } from "@/server/db/schema";
import { renderQuestion, type SolveQuestion } from "./start";

// 解き直しの回の問題を、渡した questions.id の順のまま受け取り直す。
// Result から解き直すまでのあいだに印を付けた・消した問題は除き、取り込み直した問題は今の中身で返す。
// 正解と解説は返さない（start.ts と同じく、答え合わせのあとに返す）
export async function retryQuestions(ids: number[]): Promise<SolveQuestion[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select({
      id: questions.id,
      questionId: questions.questionId,
      topic: questions.topic,
      type: questions.type,
      text: questions.text,
      choices: questions.choices,
      correctCount:
        sql<number>`count(${answers.id}) filter (where ${answers.correct})`.mapWith(
          Number,
        ),
    })
    .from(questions)
    .leftJoin(answers, eq(answers.questionId, questions.id))
    .where(and(inArray(questions.id, ids), eq(questions.flagged, false)))
    .groupBy(questions.id);

  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.flatMap((id) => {
    const row = byId.get(id);
    if (!row) return [];
    const { correctCount, ...question } = row;
    return [
      {
        ...question,
        ...renderQuestion(question.text, question.choices),
        correctBefore: correctCount > 0,
      },
    ];
  });
}
