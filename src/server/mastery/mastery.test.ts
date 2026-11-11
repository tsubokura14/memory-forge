import { describe, expect, test } from "vitest";
import { mastery } from "./mastery";

describe("mastery", () => {
  test("wrong は answered - correct、new は total - answered。% は四捨五入する", () => {
    expect(mastery({ total: 5, answered: 3, correct: 2 })).toEqual({
      correct: 2,
      wrong: 1,
      new: 2,
      accuracy: 67,
    });
  });

  test("answered が0なら % は null", () => {
    expect(mastery({ total: 4, answered: 0, correct: 0 }).accuracy).toBeNull();
  });

  test("answered が1なら % がある", () => {
    expect(mastery({ total: 4, answered: 1, correct: 0 }).accuracy).toBe(0);
  });
});
