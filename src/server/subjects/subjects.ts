import { db } from "@/server/db/client";
import { subjects } from "@/server/db/schema";

// Home の一覧。取り込んだ順（subjects.id の順）に返す
export async function listSubjects(): Promise<{ id: number; name: string }[]> {
  return db
    .select({ id: subjects.id, name: subjects.name })
    .from(subjects)
    .orderBy(subjects.id);
}
