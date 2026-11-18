import { Icon } from "@/components/icons";
import type { Mastery } from "@/server/mastery/mastery";

// docs/ui.md の「今の身についている具合」の、名前の下に出す線と数。
// 線は border の地に、最後に正解した問題（primary）・最後に間違えた問題（border-strong）を全体に対する割合の幅で左から塗り、残りがまだ解いていない問題になる。
// 下の数は色を付けず muted の文字だけにする（差し色を primary の1色に絞るため。docs/ui.md の「色の使い分け」）
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
    <span className="flex flex-col gap-1">
      <span
        aria-hidden
        className="flex h-1 overflow-hidden rounded-sm bg-border"
      >
        <span
          className="bg-primary"
          style={{ width: width(mastery.correct) }}
        />
        <span className="bg-border-strong" style={{ width: width(mastery.wrong) }} />
      </span>
      <span className="text-xs text-muted tabular-nums">
        正解 {mastery.correct} · 不正解 {mastery.wrong} · まだ {mastery.new}
        {flagged > 0 && (
          <>
            {" "}
            · {/* 折り返しても、flag の印と数は分けない */}
            {/* 印は文字より大きいので、下にそろえて行の高さを増やさない */}
            <span className="inline-flex items-center gap-0.5 align-bottom whitespace-nowrap text-warning">
              <Icon name="flag" className="text-sm leading-none" />
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
    <span className="w-10 shrink-0 text-right text-sm tabular-nums">
      {accuracy === null ? "—" : `${accuracy}%`}
    </span>
  );
}
