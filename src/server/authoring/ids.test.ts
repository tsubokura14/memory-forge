import { describe, expect, test } from "vitest";
import { assignIds, randomId } from "./ids";

function question(overrides: Record<string, unknown> = {}) {
  return {
    topic: "Decorators",
    type: "single",
    text: "出力されるものはどれか。",
    choices: ["call add", "add", "None"],
    correct: ["C"],
    explanation: "デコレータは関数を返す。",
    ...overrides,
  };
}

function file(questions: unknown[], subject: unknown = "Python") {
  return JSON.stringify({ subject, questions });
}

const target = {
  path: "/q/python-decorators.json",
  name: "python-decorators.json",
};

// 渡した値を順に返す乱数
function sequence(...values: string[]) {
  let index = 0;
  return () => {
    const value = values[index];
    index += 1;
    if (value === undefined) throw new Error("値が足りません");
    return value;
  };
}

describe("assignIds", () => {
  test("ID が空かない問題にだけ ID を付け、ID のある問題は変えない", () => {
    const result = assignIds(
      {
        ...target,
        content: file([
          question({ id: "k3f9a2" }),
          question({ id: "" }),
          question(),
        ]),
      },
      [],
      sequence("a1b2c3", "d4e5f6"),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lines).toEqual([
      "python-decorators.json：2問に ID を付けました。",
    ]);
    const written = JSON.parse(result.content ?? "");
    expect(written.questions.map((q: { id: string }) => q.id)).toEqual([
      "k3f9a2",
      "a1b2c3",
      "d4e5f6",
    ]);
  });

  test("書き戻す中身は、2文字の字下げと終わりの改行で、id をいちばん前の項目にする", () => {
    const result = assignIds(
      { ...target, content: file([question()]) },
      [],
      sequence("a1b2c3"),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const expected = {
      subject: "Python",
      questions: [{ id: "a1b2c3", ...question() }],
    };
    expect(result.content).toBe(`${JSON.stringify(expected, null, 2)}\n`);
  });

  test("同じファイルの ID と、同じ Subject のほかのファイルの ID と重なる値は作り直す", () => {
    const result = assignIds(
      {
        ...target,
        content: file([question({ id: "k3f9a2" }), question(), question()]),
      },
      [
        {
          path: "/q/python.json",
          name: "python.json",
          content: file([question({ id: "p0p0p0" })]),
        },
        {
          path: "/q/aws.json",
          name: "aws.json",
          content: file([question({ id: "w1w1w1" })], "AWS"),
        },
      ],
      // 同じファイル・ほかのファイル・この回で付けた ID と重なる値を先に返す
      sequence("k3f9a2", "p0p0p0", "a1b2c3", "a1b2c3", "w1w1w1"),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const written = JSON.parse(result.content ?? "");
    expect(written.questions.map((q: { id: string }) => q.id)).toEqual([
      "k3f9a2",
      "a1b2c3",
      "w1w1w1",
    ]);
  });

  test("ID のない問題がなければ、書き戻さない", () => {
    const result = assignIds(
      { ...target, content: file([question({ id: "k3f9a2" })]) },
      [],
      sequence(),
    );
    expect(result).toEqual({
      ok: true,
      content: null,
      lines: ["python-decorators.json：ID のない問題はありません。"],
    });
  });

  test("JSON として読めないファイルは、誤りにする", () => {
    const result = assignIds(
      { ...target, content: "{ subject:" },
      [],
      sequence(),
    );
    expect(result).toEqual({
      ok: false,
      lines: ["python-decorators.json：JSON として読めません。"],
    });
  });

  test("questions が並びでないファイルは、誤りにする", () => {
    const result = assignIds(
      {
        ...target,
        content: JSON.stringify({ subject: "Python", questions: {} }),
      },
      [],
      sequence(),
    );
    expect(result).toEqual({
      ok: false,
      lines: ["python-decorators.json：questions の形が違います。"],
    });
  });

  test("読めなかったファイルは、誤りにする", () => {
    const result = assignIds({ ...target, content: null }, [], sequence());
    expect(result).toEqual({
      ok: false,
      lines: ["python-decorators.json：ファイルを読めません。"],
    });
  });
});

describe("randomId", () => {
  test("英小文字と数字の6文字を作る", () => {
    for (let i = 0; i < 100; i += 1) {
      expect(randomId()).toMatch(/^[a-z0-9]{6}$/);
    }
  });
});
