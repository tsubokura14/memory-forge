import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { answers, questions } from "@/server/db/schema";
import { gradeAnswer } from "./grade";

export type AnswerResult = {
  correct: boolean;
  answer: string[];
  explanation: string;
};

// 答え合わせはサーバーでし、記録と1回の操作にする。記録できなかったら画面は正解・不正解を出さずに retry を出せ、
// 正解をブラウザに先に送らずに済む。問題が消えていたら失敗にする（画面は保存のエラーを出す）
export async function answerQuestion(
  id: number,
  selected: string[],
): Promise<AnswerResult> {
  const [question] = await db
    .select({
      correct: questions.correct,
      explanation: questions.explanation,
    })
    .from(questions)
    .where(eq(questions.id, id));
  if (!question) throw new Error(`Question ${id} not found.`);

  const correct = gradeAnswer(question.correct, selected);
  await db.insert(answers).values({ questionId: id, correct });
  return {
    correct,
    answer: question.correct,
    explanation: question.explanation,
  };
}

// スキップは不正解として記録する（たまたま正解して記録に残るのを避けるため。docs/overview.md）。
// 問題が消えていたら、外部キーの決まりで失敗する
export async function skipQuestion(id: number): Promise<void> {
  await db.insert(answers).values({ questionId: id, correct: false });
}
