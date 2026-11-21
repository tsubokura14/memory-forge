"use server";

import { requireSession } from "@/server/auth/session";
import {
  type AnswerResult,
  answerQuestion,
  type SkipResult,
  skipQuestion,
} from "@/server/solve/answer";
import { flagQuestion } from "@/server/solve/flag";
import type { Count, Order } from "@/server/solve/pick";
import { retryQuestions } from "@/server/solve/retry";
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

export async function skipAction(id: number): Promise<SkipResult> {
  await requireSession();
  return skipQuestion(id);
}

export async function flagAction(id: number): Promise<void> {
  await requireSession();
  await flagQuestion(id);
}

export async function retryAction(ids: number[]): Promise<SolveQuestion[]> {
  await requireSession();
  return retryQuestions(ids);
}
