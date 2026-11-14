import type { DayStreak, WeekDay } from "@/server/streak/day-streak";

// docs/ui.md の「連続日数」。左に炎と日数、右に今週の7日、下に今日の様子
const WEEKDAYS = [
  ["Mon", "M"],
  ["Tue", "T"],
  ["Wed", "W"],
  ["Thu", "T"],
  ["Fri", "F"],
  ["Sat", "S"],
  ["Sun", "S"],
];

const NUMBER_COLOR = {
  done: "text-flame",
  keep: "text-text",
  none: "text-muted",
};

export function DayStreakCard({ streak }: { streak: DayStreak }) {
  const lit = streak.today === "done";
  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span
            aria-hidden
            className={`icon text-lg leading-none sm:text-display sm:leading-none ${lit ? "icon-fill text-flame" : "text-muted"}`}
          >
            local_fire_department
          </span>
          <span
            className={`font-display text-display font-bold ${NUMBER_COLOR[streak.today]}`}
          >
            {streak.days}
          </span>
        </div>
        {/* スマホの幅では、7日の間を詰めて右に寄せる。4桁の日数でも1行に収まるよう、日の幅は縮められる */}
        <ol aria-label="this week" className="flex min-w-0 justify-end">
          {streak.week.map((day, i) => (
            <li
              key={i}
              className="flex w-6 min-w-4 shrink flex-col items-center gap-1.5 sm:w-16"
            >
              <DayMark day={day} />
              <span
                className={`font-mono text-xs ${i === streak.todayIndex ? "text-flame" : "text-muted"}`}
              >
                <span className="hidden sm:inline">{WEEKDAYS[i][0]}</span>
                <span className="sm:hidden">{WEEKDAYS[i][1]}</span>
              </span>
              {/* 今日の印。ほかの日も同じ高さを空けて、曜日の位置をそろえる */}
              <span
                aria-hidden
                className={`size-1 rounded-full ${i === streak.todayIndex ? "bg-flame" : ""}`}
              />
            </li>
          ))}
        </ol>
      </div>
      <div className="border-t border-border pt-4 font-mono text-xs">
        <TodayStatus today={streak.today} />
      </div>
    </div>
  );
}

function DayMark({ day }: { day: WeekDay }) {
  // これからの日は、炎と同じ高さの中に小さな点を置く
  if (day === "upcoming") {
    return (
      <span aria-hidden className="flex size-4.5 items-center justify-center">
        <span className="size-1.5 rounded-full bg-border" />
      </span>
    );
  }
  const style = {
    answered: "icon-fill text-flame",
    pending: "animate-pulse text-flame",
    missed: "text-border",
  }[day];
  return (
    <span aria-hidden className={`icon text-lg leading-none ${style}`}>
      local_fire_department
    </span>
  );
}

function TodayStatus({ today }: { today: DayStreak["today"] }) {
  if (today === "done") {
    return (
      <p className="flex items-center gap-1 text-success">
        <span aria-hidden className="icon text-sm leading-none">
          check
        </span>
        done today
      </p>
    );
  }
  if (today === "keep") {
    return <p className="text-flame">answer today to keep the flame</p>;
  }
  return <p className="text-muted">answer a question to light the flame</p>;
}
