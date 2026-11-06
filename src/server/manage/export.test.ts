import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { answers, questions, subjects } from "@/server/db/schema";
import { previewImport } from "@/server/import/import";
import { exportFileName, exportSubject } from "./export";

async function insertSubject(name: string) {
  const [row] = await db
    .insert(subjects)
    .values({ name })
    .returning({ id: subjects.id });
  return row.id;
}

async function insertQuestion(subjectId: number, id: string, topic: string) {
  const [row] = await db
    .insert(questions)
    .values({
      subjectId,
      questionId: id,
      topic,
      type: "multiple",
      text: `${id} の問題文\n\n\`\`\`python\n  print(1)\n\`\`\``,
      choices: ["A の選択肢", " B の選択肢 "],
      correct: ["A", "B"],
      explanation: "解説",
    })
    .returning({ id: questions.id });
  return row.id;
}

beforeEach(async () => {
  // questions と answers は subjects を消すと一緒に消える
  await db.delete(subjects);
});

describe("exportSubject", () => {
  test("Subject の全部の問題を、取り込むファイルと同じ項目だけで、取り込んだ順に書き出す", async () => {
    const python = await insertSubject("Python");
    const a = await insertQuestion(python, "a1", "Generators");
    await insertQuestion(python, "b2", "Decorators");
    await insertQuestion(python, "c3", "Generators");
    await db.insert(answers).values({ questionId: a, correct: true });
    const other = await insertSubject("AWS SAA");
    await insertQuestion(other, "z9", "IAM");

    const exported = await exportSubject(python);
    expect(exported?.fileName).toBe("python.json");
    const file = JSON.parse(exported!.content);
    expect(file.subject).toBe("Python");
    expect(file.questions.map((q: { id: string }) => q.id)).toEqual([
      "a1",
      "b2",
      "c3",
    ]);
    expect(file.questions[0]).toEqual({
      id: "a1",
      topic: "Generators",
      type: "multiple",
      text: "a1 の問題文\n\n```python\n  print(1)\n```",
      choices: ["A の選択肢", " B の選択肢 "],
      correct: ["A", "B"],
      explanation: "解説",
    });
  });

  test("書き出したものを取り込み直すと、全部「変わらない」になる", async () => {
    const python = await insertSubject("Python");
    await insertQuestion(python, "a1", "Generators");
    await insertQuestion(python, "b2", "Decorators");

    const exported = await exportSubject(python);
    expect(await previewImport(exported!.content)).toMatchObject({
      ok: true,
      isNewSubject: false,
      counts: { added: 0, replaced: 0, unchanged: 2 },
    });
  });

  test("ない Subject は null", async () => {
    expect(await exportSubject(1)).toBeNull();
  });
});

describe("exportFileName", () => {
  test("小文字にし、空白と記号を「-」にして、続くものを1つにまとめ、頭と終わりの「-」を除く", () => {
    expect(exportFileName("Python")).toBe("python.json");
    expect(exportFileName("Web API")).toBe("web-api.json");
    expect(exportFileName(" C++ / Rust ")).toBe("c++-rust.json");
  });

  test("名前が空になるときは subject.json", () => {
    expect(exportFileName("???")).toBe("subject.json");
  });
});
