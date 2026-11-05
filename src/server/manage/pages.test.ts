import { describe, expect, test } from "vitest";
import { lastPage, pageItems, rangeText } from "./pages";

describe("lastPage", () => {
  test("50問は1ページ、51問は2ページ", () => {
    expect(lastPage(50)).toBe(1);
    expect(lastPage(51)).toBe(2);
  });
});

describe("pageItems", () => {
  test("1ページで収まるときは、番号を出さない", () => {
    expect(pageItems(1, 1)).toEqual([]);
  });

  test("最初・最後・今の前後だけを出し、間は「…」にする", () => {
    expect(pageItems(4, 10)).toEqual([1, "…", 3, 4, 5, "…", 10]);
  });

  test("間がないところには「…」を出さない", () => {
    expect(pageItems(2, 10)).toEqual([1, 2, 3, "…", 10]);
    expect(pageItems(10, 10)).toEqual([1, "…", 9, 10]);
    expect(pageItems(2, 3)).toEqual([1, 2, 3]);
  });
});

describe("rangeText", () => {
  test("今のページの最初と最後の問題の番号と、全部の数", () => {
    expect(rangeText(4, 480)).toBe("151–200 of 480");
  });

  test("最後のページは、全部の数で止める", () => {
    expect(rangeText(10, 480)).toBe("451–480 of 480");
  });
});
