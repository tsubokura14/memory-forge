// 連続日数の計算。データベースを使わない

// 日の区切りは日本時間の0時（使う人が日本にいる前提。連続日数だけの決まり）。answered-days.ts もこれを使う
export const STREAK_TIME_ZONE = "Asia/Tokyo";

// 今週の日の状態。missed は今日より前で答えなかった日、pending は今日でまだ答えていない日
export type WeekDay = "answered" | "missed" | "pending" | "upcoming";

export type DayStreak = {
  days: number;
  // done：今日答えた、keep：今日まだで日数が1以上、none：日数が0
  today: "done" | "keep" | "none";
  // 今週の月〜日
  week: WeekDay[];
  // 今日が week の何番目か（月曜が 0）。今日答えたあとは week から今日がわからないため持つ
  todayIndex: number;
};

// その時刻の日本時間の日付（"YYYY-MM-DD"）。en-CA の書式が YYYY-MM-DD になる
export function tokyoDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STREAK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// 日付は "YYYY-MM-DD" の文字列のまま比べ、ずらすときだけ UTC の Date にする（実行する場所の時間帯に左右されないため）
function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// 月曜が 0、日曜が 6
function weekdayIndex(date: string): number {
  return (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function dayStreak(answeredDays: string[], today: string): DayStreak {
  const answered = new Set(answeredDays);
  const doneToday = answered.has(today);

  let days = 0;
  let day = doneToday ? today : addDays(today, -1);
  while (answered.has(day)) {
    days += 1;
    day = addDays(day, -1);
  }

  const todayIndex = weekdayIndex(today);
  const monday = addDays(today, -todayIndex);
  const week = Array.from({ length: 7 }, (_, i): WeekDay => {
    const date = addDays(monday, i);
    if (answered.has(date)) return "answered";
    if (i < todayIndex) return "missed";
    if (i === todayIndex) return "pending";
    return "upcoming";
  });

  return {
    days,
    today: doneToday ? "done" : days > 0 ? "keep" : "none",
    week,
    todayIndex,
  };
}
