import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { questions, subjects } from "@/server/db/schema";
import type { QuestionFile } from "@/server/import/validate";

// Subject の全部の問題（flaggedOnly なら印の付いた問題だけ）を、取り込むファイルと同じ形（docs/specs/import.md の「問題のファイル」）の JSON にする。
// 記録は入れない。問題は取り込んだ順（questions.id の順）。問題の数は確かめず、Import の上限を超える Subject も書き出す。
// ない Subject は null
export async function exportSubject(
  subjectId: number,
  flaggedOnly: boolean,
): Promise<{ fileName: string; content: string } | null> {
  const [subject] = await db
    .select({ name: subjects.name })
    .from(subjects)
    .where(eq(subjects.id, subjectId));
  if (!subject) return null;

  const rows = await db
    .select({
      id: questions.questionId,
      topic: questions.topic,
      type: questions.type,
      text: questions.text,
      choices: questions.choices,
      correct: questions.correct,
      explanation: questions.explanation,
    })
    .from(questions)
    .where(
      and(
        eq(questions.subjectId, subjectId),
        flaggedOnly ? eq(questions.flagged, true) : undefined,
      ),
    )
    .orderBy(questions.id);

  const file: QuestionFile = { subject: subject.name, questions: rows };
  return {
    fileName: exportFileName(subject.name),
    content: `${JSON.stringify(file, null, 2)}\n`,
  };
}

// 小文字にし、空白とファイル名に使えない記号（Windows で使えないもの）・制御文字を「-」にする。
// 続く「-」は1つにまとめ、頭と終わりの「-」は除く。それで名前が空になるときは subject.json
export function exportFileName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[\s\\/:*?"<>|\u0000-\u001f]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base === "" ? "subject" : base}.json`;
}
