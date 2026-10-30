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

// Subject を空にし、渡した Subject と問題だけを入れる
export async function resetQuestions(
  subjects: { name: string; questions: TestQuestion[] }[] = [],
) {
  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  try {
    const db = drizzle({ client: pool, schema });
    // questions は subjects を消すと一緒に消える
    await db.delete(schema.subjects);
    for (const subject of subjects) {
      const [row] = await db
        .insert(schema.subjects)
        .values({ name: subject.name })
        .returning({ id: schema.subjects.id });
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
        })),
      );
    }
  } finally {
    await pool.end();
  }
}
