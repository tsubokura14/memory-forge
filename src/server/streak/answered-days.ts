import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { answers, questions } from "@/server/db/schema";
import { STREAK_TIME_ZONE } from "./day-streak";

// 印のない問題に答えた日を、日本時間の日付（"YYYY-MM-DD"）で重ねずに古い順に返す。スキップも不正解の答えとして入っている。
// 全部の日を返す。前提（崩れたら見直す）：使う人はひとりで、日の数は数千まで。重くなったら、今日からさかのぼる分だけにする
export async function listAnsweredDays(): Promise<string[]> {
  const day = sql<string>`to_char((${answers.answeredAt} at time zone ${STREAK_TIME_ZONE})::date, 'YYYY-MM-DD')`;
  const rows = await db
    .selectDistinct({ day })
    .from(answers)
    .innerJoin(
      questions,
      and(eq(questions.id, answers.questionId), eq(questions.flagged, false)),
    );
  // "YYYY-MM-DD" は文字列の順が日付の順
  return rows.map((row) => row.day).sort();
}
