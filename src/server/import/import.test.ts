import { asc, eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { questions, subjects } from "@/server/db/schema";
import { applyImport, previewImport } from "./import";
import type { FileQuestion } from "./validate";

function question(overrides: Partial<FileQuestion> = {}): FileQuestion {
  return {
    id: "k3f9a2",
    topic: "Decorators",
    type: "single",
    text: "次のコードを実行したとき、出力されるものはどれか。",
    choices: ["call add", "add", "None"],
    correct: ["C"],
    explanation: "デコレータは関数を返す。",
    ...overrides,
  };
}

function file(qs: FileQuestion[], subject = "Python") {
  return JSON.stringify({ subject, questions: qs });
}

// 入っている問題を、ファイルと同じ形で読む（Subject の名前、ID の順）
async function storedQuestions() {
  const rows = await db
    .select({
      subject: subjects.name,
      id: questions.questionId,
      topic: questions.topic,
      type: questions.type,
      text: questions.text,
      choices: questions.choices,
      correct: questions.correct,
      explanation: questions.explanation,
    })
    .from(questions)
    .innerJoin(subjects, eq(questions.subjectId, subjects.id))
    .orderBy(asc(subjects.name), asc(questions.questionId));
  return rows;
}

const first = [
  question({ id: "a1", topic: "Decorators" }),
  question({ id: "b2", topic: "Generators" }),
  question({ id: "c3", topic: "Decorators" }),
];

beforeEach(async () => {
  // questions は subjects を消すと一緒に消える
  await db.delete(subjects);
});

describe("previewImport", () => {
  test("まだない Subject なら、新しくできることと増える数を出し、何も書かない", async () => {
    expect(await previewImport(file(first))).toEqual({
      ok: true,
      subject: "Python",
      isNewSubject: true,
      counts: { added: 3, replaced: 0, unchanged: 0 },
      replaced: [],
    });
    expect(await db.select().from(subjects)).toEqual([]);
  });

  test("取り込み済みの問題と比べ、置き換わる問題の前と後を出し、何も書かない", async () => {
    await applyImport(file(first));
    const next = [
      question({ id: "a1", topic: "Decorators" }),
      question({ id: "b2", topic: "Generators", explanation: "新しい解説" }),
      question({ id: "d4" }),
    ];
    expect(await previewImport(file(next))).toEqual({
      ok: true,
      subject: "Python",
      isNewSubject: false,
      counts: { added: 1, replaced: 1, unchanged: 1 },
      replaced: [
        {
          id: "b2",
          text: next[1].text,
          changes: [
            {
              item: "explanation",
              before: "デコレータは関数を返す。",
              after: "新しい解説",
            },
          ],
        },
      ],
    });
    expect((await storedQuestions()).map((q) => q.explanation)).toEqual([
      "デコレータは関数を返す。",
      "デコレータは関数を返す。",
      "デコレータは関数を返す。",
    ]);
  });

  test("誤りがあれば、誤りの一覧を返す", async () => {
    expect(await previewImport("{")).toEqual({
      ok: false,
      errors: [{ id: "—", item: "file", message: "Not valid JSON." }],
    });
  });
});

describe("applyImport", () => {
  test("まだない Subject を作り、問題を書かれたまま入れる", async () => {
    const text = "  字下げ\n```python\nprint(1)\n```";
    expect(await applyImport(file([question({ id: "a1", text })]))).toEqual({
      ok: true,
      subject: "Python",
      counts: { added: 1, replaced: 0, unchanged: 0 },
    });
    expect(await storedQuestions()).toEqual([
      { subject: "Python", ...question({ id: "a1", text }) },
    ]);
  });

  test("増える問題を足し、置き換わる問題を新しくし、ファイルにない問題は残す", async () => {
    await applyImport(file(first));
    const result = await applyImport(
      file([
        question({ id: "a1", topic: "Generators" }),
        question({ id: "b2", topic: "Generators" }),
        question({ id: "d4", topic: "Generators" }),
      ]),
    );
    expect(result).toEqual({
      ok: true,
      subject: "Python",
      counts: { added: 1, replaced: 1, unchanged: 1 },
    });
    expect((await storedQuestions()).map((q) => [q.id, q.topic])).toEqual([
      ["a1", "Generators"],
      ["b2", "Generators"],
      ["c3", "Decorators"],
      ["d4", "Generators"],
    ]);
  });

  test("問題が1つもなくなった Topic は消える", async () => {
    await applyImport(file([question({ id: "a1", topic: "Decorators" })]));
    await applyImport(file([question({ id: "a1", topic: "Generators" })]));
    const topics = await db
      .selectDistinct({ topic: questions.topic })
      .from(questions);
    expect(topics).toEqual([{ topic: "Generators" }]);
  });

  test("Subject が違えば、ID が同じでも別の問題になる", async () => {
    await applyImport(file([question({ id: "a1" })], "Python"));
    const result = await applyImport(file([question({ id: "a1" })], "Rust"));
    expect(result).toMatchObject({ counts: { added: 1 } });
    expect((await storedQuestions()).map((q) => [q.subject, q.id])).toEqual([
      ["Python", "a1"],
      ["Rust", "a1"],
    ]);
  });

  test("誤りがあれば、何も書かずに誤りの一覧を返す", async () => {
    const result = await applyImport(
      file([question({ id: "a1" }), question({ id: "b2", explanation: "" })]),
    );
    expect(result).toEqual({
      ok: false,
      errors: [{ id: "b2", item: "explanation", message: "Missing." }],
    });
    expect(await db.select().from(subjects)).toEqual([]);
  });
});
