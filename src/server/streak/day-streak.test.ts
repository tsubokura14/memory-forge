import { describe, expect, test } from "vitest";
import { dayStreak, tokyoDate } from "./day-streak";

describe("tokyoDate", () => {
  test("日本時間の 23:59:59 はその日、0:00:00 は次の日", () => {
    expect(tokyoDate(new Date("2026-01-15T23:59:59+09:00"))).toBe("2026-01-15");
    expect(tokyoDate(new Date("2026-01-16T00:00:00+09:00"))).toBe("2026-01-16");
  });
});

describe("dayStreak", () => {
  test("今日答えていれば、今日を含めて数え、done", () => {
    expect(
      dayStreak(
        ["2026-01-12", "2026-01-13", "2026-01-14", "2026-01-15"],
        "2026-01-15",
      ),
    ).toEqual({
      days: 4,
      today: "done",
    });
  });

  test("今日まだで昨日答えていれば、昨日までの日数で keep", () => {
    expect(
      dayStreak(["2026-01-12", "2026-01-13", "2026-01-14"], "2026-01-15"),
    ).toEqual({
      days: 3,
      today: "keep",
    });
  });

  test("今日も昨日もなければ0で none", () => {
    expect(dayStreak(["2026-01-13"], "2026-01-15")).toEqual({
      days: 0,
      today: "none",
    });
  });

  test("途中で切れていれば、切れた日の後から数える", () => {
    expect(
      dayStreak(
        ["2026-01-10", "2026-01-12", "2026-01-13", "2026-01-14", "2026-01-15"],
        "2026-01-15",
      ).days,
    ).toBe(4);
  });

  test("週・月・年をまたいで続けて数える。並びは問わない", () => {
    expect(
      dayStreak(
        ["2026-01-01", "2025-12-31", "2026-01-02", "2025-12-30"],
        "2026-01-02",
      ).days,
    ).toBe(4);
  });
});
