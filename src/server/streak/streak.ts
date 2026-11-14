import { listAnsweredDays } from "./answered-days";
import { dayStreak, tokyoDate, type DayStreak } from "./day-streak";

// Home の連続日数。「今」は呼ぶ側が渡す
export async function getDayStreak(now: Date): Promise<DayStreak> {
  return dayStreak(await listAnsweredDays(), tokyoDate(now));
}
