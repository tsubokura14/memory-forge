import { and, count as countRows, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { answers, questions } from "@/server/db/schema";
import type { QuestionType } from "@/server/import/validate";
import { type Count, type Order, pickQuestions } from "./pick";

// 解く画面に渡す問題。正解と解説は、答え合わせのあとに返す（answer.ts）。選択肢はファイルの順のまま
export type SolveQuestion = {
  id: number;
  questionId: string;
  topic: string;
  type: QuestionType;
  text: string;
  choices: string[];
  // start の時点の記録に、一度でも正解があるか（解き終わりの結果で「前は正解したのに今回間違えた」を見分ける）。
  // 1つの回に同じ問題は2回出ないので、解いている間に足した記録はこの問題の判定に混ざらない
  correctBefore: boolean;
};

// topic が null なら、その Subject の全部の Topic（All）
export async function startSession(
  subjectId: number,
  topic: string | null,
  order: Order,
  count: Count,
): Promise<SolveQuestion[]> {
  const rows = await db
    .select({
      id: questions.id,
      questionId: questions.questionId,
      topic: questions.topic,
      type: questions.type,
      text: questions.text,
      choices: questions.choices,
      answerCount: countRows(answers.id),
      correctCount:
        sql<number>`count(*) filter (where ${answers.correct})`.mapWith(Number),
    })
    .from(questions)
    .leftJoin(answers, eq(answers.questionId, questions.id))
    .where(
      and(
        eq(questions.subjectId, subjectId),
        topic === null ? undefined : eq(questions.topic, topic),
      ),
    )
    .groupBy(questions.id);

  return pickQuestions(rows, order, count).map(
    ({ id, questionId, topic, type, text, choices, correctCount }) => ({
      id,
      questionId,
      topic,
      type,
      text,
      choices,
      correctBefore: correctCount > 0,
    }),
  );
}
