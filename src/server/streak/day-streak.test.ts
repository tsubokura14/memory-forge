import { describe, expect, test } from "vitest";
import { dayStreak, tokyoDate } from "./day-streak";

describe("tokyoDate", () => {
  test("日本時間の 23:59:59 はその日、0:00:00 は次の日", () => {
    expect(tokyoDate(new Date("2026-01-15T23:59:59+09:00"))).toBe("2026-01-15");
    expect(tokyoDate(new Date("2026-01-16T00:00:00+09:00"))).toBe("2026-01-16");
  });
});

// 2026-01-12 が月曜、2026-01-15 が木曜、2026-01-18 が日曜
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
      week: [
        "answered",
        "answered",
        "answered",
        "answered",
        "upcoming",
        "upcoming",
        "upcoming",
      ],
      todayIndex: 3,
    });
  });

  test("今日まだで昨日答えていれば、昨日までの日数で keep。今日は pending", () => {
    expect(
      dayStreak(["2026-01-12", "2026-01-13", "2026-01-14"], "2026-01-15"),
    ).toEqual({
      days: 3,
      today: "keep",
      week: [
        "answered",
        "answered",
        "answered",
        "pending",
        "upcoming",
        "upcoming",
        "upcoming",
      ],
      todayIndex: 3,
    });
  });

  test("今日も昨日もなければ0で none。今週答えた日は answered のまま、答えなかった日は missed", () => {
    expect(dayStreak(["2026-01-13"], "2026-01-15")).toEqual({
      days: 0,
      today: "none",
      week: [
        "missed",
        "answered",
        "missed",
        "pending",
        "upcoming",
        "upcoming",
        "upcoming",
      ],
      todayIndex: 3,
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

  test("今日が月曜なら、week の最初が今日で、前の週の日は入らない", () => {
    expect(dayStreak(["2026-01-11"], "2026-01-12")).toEqual({
      days: 1,
      today: "keep",
      week: [
        "pending",
        "upcoming",
        "upcoming",
        "upcoming",
        "upcoming",
        "upcoming",
        "upcoming",
      ],
      todayIndex: 0,
    });
  });

  test("今日が日曜なら、week の最後が今日", () => {
    expect(dayStreak(["2026-01-18"], "2026-01-18")).toEqual({
      days: 1,
      today: "done",
      week: [
        "missed",
        "missed",
        "missed",
        "missed",
        "missed",
        "missed",
        "answered",
      ],
      todayIndex: 6,
    });
  });
});
