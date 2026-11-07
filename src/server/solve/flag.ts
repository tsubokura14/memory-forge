import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { questions } from "@/server/db/schema";

// 問題の印を付ける・外す。もう付いている・外れているときも、そのまま成功にする（押し直しや retry で失敗にしないため）。
// 問題が消えていたら失敗にする（画面は失敗の帯を出す）
export async function flagQuestion(id: number): Promise<void> {
  await setFlagged(id, true);
}

export async function unflagQuestion(id: number): Promise<void> {
  await setFlagged(id, false);
}

async function setFlagged(id: number, flagged: boolean) {
  const rows = await db
    .update(questions)
    .set({ flagged })
    .where(eq(questions.id, id))
    .returning({ id: questions.id });
  if (rows.length === 0) throw new Error(`Question ${id} not found.`);
}
