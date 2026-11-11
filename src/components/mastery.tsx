import type { Mastery } from "@/server/mastery/mastery";

// docs/ui.md の「今の身についている具合」の、名前の下に出す線と数。
// 線は border の地に、correct（success）・wrong（danger）を全体に対する割合の幅で左から塗り、残りが new になる
export function MasteryBar({
  mastery,
  flagged = 0,
}: {
  mastery: Mastery;
  flagged?: number;
}) {
  const all = mastery.correct + mastery.wrong + mastery.new;
  // 全部に印が付いて数える問題がないときは塗らず、全部 border の線にする
  const width = (n: number) => `${all === 0 ? 0 : (n / all) * 100}%`;
  return (
    <span className="flex flex-col gap-1.5">
      <span
        aria-hidden
        className="flex h-1 overflow-hidden rounded-sm bg-border"
      >
        <span
          className="bg-success"
          style={{ width: width(mastery.correct) }}
        />
        <span className="bg-danger" style={{ width: width(mastery.wrong) }} />
      </span>
      <span className="font-mono text-xs text-muted">
        <span className="text-success">{mastery.correct}</span> correct ·{" "}
        <span className="text-danger">{mastery.wrong}</span> wrong ·{" "}
        {mastery.new} new
        {flagged > 0 && (
          <>
            {" "}
            · {/* 折り返しても、flag の印と数は分けない */}
            <span className="inline-flex items-center gap-0.5 whitespace-nowrap text-warning">
              <span aria-hidden className="icon text-sm leading-none">
                flag
              </span>
              {flagged}
            </span>
          </>
        )}
      </span>
    </span>
  );
}

// 行の右に出す %。解いた問題がないときは「—」。TopicResultRow の % と同じ幅で右にそろえる
export function MasteryAccuracy({ accuracy }: { accuracy: number | null }) {
  return (
    <span className="w-10 shrink-0 text-right font-mono text-sm">
      {accuracy === null ? "—" : `${accuracy}%`}
    </span>
  );
}
