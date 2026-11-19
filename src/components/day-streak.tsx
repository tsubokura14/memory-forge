import { Icon } from "@/components/icons";
import type { DayStreak } from "@/server/streak/day-streak";

// docs/ui.md の「連続日数」。Home の「続きから」のカードの右上の1行。
// 今日答えていれば灯った炎と文字を flame で、まだなら線だけの炎と muted の文字で出す
export function DayStreakLine({ streak }: { streak: DayStreak }) {
  const lit = streak.today === "done";
  const days = streak.days.toLocaleString("ja-JP");
  const text = {
    done: `${days}日連続`,
    keep: `${days}日連続・今日はまだ`,
    none: "今日解くと連続日数が始まります",
  }[streak.today];
  return (
    <p
      className={`flex items-center gap-1 text-xs ${lit ? "text-flame" : "text-muted"}`}
    >
      <Icon name="flame" filled={lit} className="text-sm" />
      {text}
    </p>
  );
}
