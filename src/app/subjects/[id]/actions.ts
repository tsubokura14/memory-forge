"use server";

import { requireSession } from "@/server/auth/session";
import {
  type AnswerResult,
  answerQuestion,
  skipQuestion,
} from "@/server/solve/answer";
import { flagQuestion } from "@/server/solve/flag";
import type { Count, Order } from "@/server/solve/pick";
import { type SolveQuestion, startSession } from "@/server/solve/start";

export async function startSessionAction(
  subjectId: number,
  topic: string | null,
  order: Order,
  count: Count,
): Promise<SolveQuestion[]> {
  await requireSession();
  return startSession(subjectId, topic, order, count);
}

export async function answerAction(
  id: number,
  selected: string[],
): Promise<AnswerResult> {
  await requireSession();
  return answerQuestion(id, selected);
}

export async function skipAction(id: number): Promise<void> {
  await requireSession();
  await skipQuestion(id);
}

export async function flagAction(id: number): Promise<void> {
  await requireSession();
  await flagQuestion(id);
}
