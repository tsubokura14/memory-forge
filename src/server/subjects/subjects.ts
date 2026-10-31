import { db } from "@/server/db/client";
import { subjects } from "@/server/db/schema";

// Subject が1つでもあるか（Home の0件の表示に使う）
export async function hasSubjects(): Promise<boolean> {
  const rows = await db.select({ id: subjects.id }).from(subjects).limit(1);
  return rows.length > 0;
}
