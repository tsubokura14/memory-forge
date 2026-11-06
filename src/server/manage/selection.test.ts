import { describe, expect, test } from "vitest";
import {
  nextSubjectAfterDelete,
  parseSaved,
  resolveSelection,
} from "./selection";

const subjects = [
  {
    id: 1,
    topics: [
      { name: "Decorators", count: 120 },
      { name: "Typing", count: 12 },
    ],
  },
  { id: 2, topics: [{ name: "IAM", count: 30 }] },
];

describe("resolveSelection", () => {
  test("覚えていないときは、最初の Subject・All topics・1ページ目", () => {
    expect(resolveSelection(null, subjects)).toEqual({
      subjectId: 1,
      topic: null,
      page: 1,
      total: 132,
    });
  });

  test("覚えていた Subject・Topic・ページがあれば、そのまま", () => {
    expect(
      resolveSelection(
        { subjectId: 1, topic: "Decorators", page: 3 },
        subjects,
      ),
    ).toEqual({ subjectId: 1, topic: "Decorators", page: 3, total: 120 });
  });

  test("覚えていた Subject がなくなっていたら、最初の Subject と All topics", () => {
    expect(
      resolveSelection({ subjectId: 9, topic: "IAM", page: 1 }, subjects),
    ).toEqual({ subjectId: 1, topic: null, page: 1, total: 132 });
  });

  test("覚えていた Topic がなくなっていたら、All topics", () => {
    expect(
      resolveSelection({ subjectId: 2, topic: "Typing", page: 1 }, subjects),
    ).toEqual({ subjectId: 2, topic: null, page: 1, total: 30 });
  });

  test("覚えていたページがなくなっていたら、最後のページ", () => {
    expect(
      resolveSelection({ subjectId: 1, topic: "Typing", page: 2 }, subjects),
    ).toEqual({ subjectId: 1, topic: "Typing", page: 1, total: 12 });
  });
});

describe("parseSaved", () => {
  test("cookie の JSON から、覚えていた選び方を読む", () => {
    expect(
      parseSaved(JSON.stringify({ subjectId: 2, topic: "IAM", page: 4 })),
    ).toEqual({ subjectId: 2, topic: "IAM", page: 4 });
  });

  test("ない・読めない・形が違うときは null", () => {
    expect(parseSaved(undefined)).toBeNull();
    expect(parseSaved("{")).toBeNull();
    expect(parseSaved(JSON.stringify({ subjectId: "2", page: 1 }))).toBeNull();
    expect(
      parseSaved(JSON.stringify({ subjectId: 2, topic: null, page: 0 })),
    ).toBeNull();
  });
});

describe("nextSubjectAfterDelete", () => {
  // 残っている Subject の id（取り込んだ順）と、消した Subject の id から選ぶ
  test("消した Subject の次の Subject", () => {
    expect(nextSubjectAfterDelete([1, 3, 4], 2)).toBe(3);
  });

  test("消した Subject が最後なら、前の Subject", () => {
    expect(nextSubjectAfterDelete([1, 3], 4)).toBe(3);
  });

  test("ほかに Subject がなければ null", () => {
    expect(nextSubjectAfterDelete([], 2)).toBeNull();
  });
});
