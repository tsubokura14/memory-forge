import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { questions, subjects } from "@/server/db/schema";
import { type Change, diffQuestions } from "./diff";
import {
  type FileError,
  type FileQuestion,
  validateQuestionFile,
} from "./validate";

export type ImportCounts = {
  added: number;
  replaced: number;
  unchanged: number;
};

export type ImportPreview =
  | { ok: false; errors: FileError[] }
  | {
      ok: true;
      subject: string;
      isNewSubject: boolean;
      counts: ImportCounts;
      replaced: { id: string; text: string; changes: Change[] }[];
    };

export type ImportResult =
  | { ok: false; errors: FileError[] }
  | { ok: true; subject: string; counts: ImportCounts };

type Db = typeof db;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

// 取り込む前の確認。確かめて、取り込み済みの問題と比べるだけで、何も書かない
export async function previewImport(content: string): Promise<ImportPreview> {
  const validated = validateQuestionFile(content);
  if (!validated.ok) return validated;
  const { subject, questions: incoming } = validated.file;

  const subjectId = await findSubjectId(db, subject);
  const stored =
    subjectId === undefined ? [] : await readQuestions(db, subjectId);
  const diff = diffQuestions(incoming, stored);
  return {
    ok: true,
    subject,
    isNewSubject: subjectId === undefined,
    counts: countsOf(diff),
    replaced: diff.replaced.map(({ question, changes }) => ({
      id: question.id,
      text: question.text,
      changes,
    })),
  };
}

// 取り込み。確認のあとに送られた中身を確かめ直し、1つのトランザクションの中で比べて書く。
// 全部が入るか、何も入らないかのどちらか。変わらない問題とファイルにない問題には触らない
export async function applyImport(content: string): Promise<ImportResult> {
  const validated = validateQuestionFile(content);
  if (!validated.ok) return validated;
  const { subject, questions: incoming } = validated.file;

  return db.transaction(async (tx) => {
    const subjectId = await findOrCreateSubjectId(tx, subject);
    const diff = diffQuestions(incoming, await readQuestions(tx, subjectId));
    const toWrite = [...diff.added, ...diff.replaced.map((r) => r.question)];

    if (toWrite.length > 0) {
      // 増える問題と置き換わる問題を、1つの SQL で書く。問題は多くても1,000問なので、1回に収まる
      await tx
        .insert(questions)
        .values(
          toWrite.map((q) => ({
            subjectId,
            questionId: q.id,
            topic: q.topic,
            type: q.type,
            text: q.text,
            choices: q.choices,
            correct: q.correct,
            explanation: q.explanation,
          })),
        )
        .onConflictDoUpdate({
          target: [questions.subjectId, questions.questionId],
          set: {
            topic: sql`excluded.topic`,
            type: sql`excluded.type`,
            text: sql`excluded.text`,
            choices: sql`excluded.choices`,
            correct: sql`excluded.correct`,
            explanation: sql`excluded.explanation`,
            updatedAt: sql`now()`,
          },
        });
    }
    return { ok: true, subject, counts: countsOf(diff) };
  });
}

function countsOf(diff: ReturnType<typeof diffQuestions>): ImportCounts {
  return {
    added: diff.added.length,
    replaced: diff.replaced.length,
    unchanged: diff.unchanged.length,
  };
}

async function findSubjectId(
  executor: Db | Tx,
  name: string,
): Promise<number | undefined> {
  const [row] = await executor
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.name, name));
  return row?.id;
}

async function findOrCreateSubjectId(tx: Tx, name: string): Promise<number> {
  const [created] = await tx
    .insert(subjects)
    .values({ name })
    .onConflictDoNothing()
    .returning({ id: subjects.id });
  if (created) return created.id;
  const existing = await findSubjectId(tx, name);
  if (existing === undefined) throw new Error("Subject が見つからない");
  return existing;
}

async function readQuestions(
  executor: Db | Tx,
  subjectId: number,
): Promise<FileQuestion[]> {
  return executor
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
    .where(eq(questions.subjectId, subjectId));
}
