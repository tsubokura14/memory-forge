import { desc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { answers } from "@/server/db/schema";

// 問題ごとの最後の答え（Home と Setup の身についている具合で使う副問い合わせ）。
// answered_at ではなく answers.id がいちばん大きい行にする。id は足した順に増えるので、同じ時刻に2行あっても1つに決まる
export const lastAnswer = db
  .selectDistinctOn([answers.questionId], {
    questionId: answers.questionId,
    correct: answers.correct,
  })
  .from(answers)
  .orderBy(answers.questionId, desc(answers.id))
  .as("last_answer");
