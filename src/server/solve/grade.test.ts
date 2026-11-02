import { describe, expect, test } from "vitest";
import { gradeAnswer } from "./grade";

describe("gradeAnswer", () => {
  test("単一選択：正解の記号を選べば正解、ほかは不正解", () => {
    expect(gradeAnswer(["C"], ["C"])).toBe(true);
    expect(gradeAnswer(["C"], ["A"])).toBe(false);
  });

  test("複数選択：正解を全部選べば、選んだ順に関わらず正解", () => {
    expect(gradeAnswer(["A", "C"], ["C", "A"])).toBe(true);
  });

  test("複数選択：正解が1つ足りないと不正解（部分点なし）", () => {
    expect(gradeAnswer(["A", "C"], ["A"])).toBe(false);
  });

  test("複数選択：正解でないものを1つ多く選ぶと不正解", () => {
    expect(gradeAnswer(["A", "C"], ["A", "B", "C"])).toBe(false);
  });
});
