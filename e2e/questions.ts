import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { withVerifyFull } from "../src/server/db/connection-url";
import * as schema from "../src/server/db/schema";

// 画面のテストで、test（CI では ci）のデータベースの Subject と問題を入れ直す。
// 状態は、テストの前に決まったデータを入れて作る（docs/design.md の「画面の画像を撮る・比べる仕組み」）

export type TestQuestion = {
  id: string;
  topic: string;
  type: "single" | "multiple";
  text: string;
  choices: string[];
  correct: string[];
  explanation: string;
  flagged?: boolean;
};

export function testQuestion(
  id: string,
  overrides: Partial<TestQuestion> = {},
): TestQuestion {
  return {
    id,
    topic: "Decorators",
    type: "single",
    text: "次のコードを実行したとき、出力されるものはどれか。",
    choices: ["call add", "add", "None", "エラー"],
    correct: ["C"],
    explanation: "デコレータは関数を返す。",
    ...overrides,
  };
}

export function questionFile(subject: string, questions: TestQuestion[]) {
  return JSON.stringify({ subject, questions }, null, 2);
}

// Subject を空にし、渡した Subject と問題だけを入れる。入れた Subject の id を、渡した順に返す
export async function resetQuestions(
  subjects: { name: string; questions: TestQuestion[] }[] = [],
): Promise<number[]> {
  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  const ids: number[] = [];
  try {
    const db = drizzle({ client: pool, schema });
    // questions は subjects を消すと一緒に消える
    await db.delete(schema.subjects);
    for (const subject of subjects) {
      const [row] = await db
        .insert(schema.subjects)
        .values({ name: subject.name })
        .returning({ id: schema.subjects.id });
      ids.push(row.id);
      await db.insert(schema.questions).values(
        subject.questions.map((q) => ({
          subjectId: row.id,
          questionId: q.id,
          topic: q.topic,
          type: q.type,
          text: q.text,
          choices: q.choices,
          correct: q.correct,
          explanation: q.explanation,
          flagged: q.flagged ?? false,
        })),
      );
    }
  } finally {
    await pool.end();
  }
  return ids;
}

// 答えた記録の行の数
export async function countAnswers(): Promise<number> {
  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  try {
    const db = drizzle({ client: pool, schema });
    return (await db.select().from(schema.answers)).length;
  } finally {
    await pool.end();
  }
}

// 答えた記録を入れる。questionId はファイルの ID（resetQuestions で入れた問題の中から探す）
export async function insertAnswers(
  records: { questionId: string; correct: boolean }[],
): Promise<void> {
  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  try {
    const db = drizzle({ client: pool, schema });
    const rows = await db
      .select({
        id: schema.questions.id,
        questionId: schema.questions.questionId,
      })
      .from(schema.questions);
    const idOf = new Map(rows.map((r) => [r.questionId, r.id]));
    await db.insert(schema.answers).values(
      records.map((r) => {
        const id = idOf.get(r.questionId);
        if (id === undefined) throw new Error(`No question ${r.questionId}.`);
        return { questionId: id, correct: r.correct };
      }),
    );
  } finally {
    await pool.end();
  }
}
