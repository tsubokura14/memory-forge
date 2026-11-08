// 解く画面の上のバー（docs/ui.md の「進み具合」）。左に quit、右にここまでの正解・不正解（スキップを含む）の数と今の問題の番号。
// 下の端の線は、終えた問題（answered。答えた・skip・答える前に印を付けた）の割合だけ伸びる。onQuit がないとき（問題の読み込み中）は、quit を押せない
export function SolveBar({
  correct,
  wrong,
  answered,
  current,
  total,
  onQuit,
}: {
  correct: number;
  wrong: number;
  answered: number;
  current: number;
  total: number;
  onQuit?: () => void;
}) {
  const progress = total === 0 ? 0 : (answered / total) * 100;
  return (
    <header className="bg-surface">
      <div className="mx-auto flex max-w-page items-center justify-between px-4 py-2">
        <button
          type="button"
          onClick={onQuit}
          disabled={!onQuit}
          className="flex items-center gap-1 font-mono text-sm text-muted disabled:opacity-50"
        >
          <span aria-hidden className="icon text-base">
            arrow_back
          </span>
          quit
        </button>
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="flex items-center gap-0.5 text-success">
            <span aria-hidden className="icon text-base">
              check
            </span>
            <span aria-label="correct answers">{correct}</span>
          </span>
          <span className="flex items-center gap-0.5 text-danger">
            <span aria-hidden className="icon text-base">
              close
            </span>
            <span aria-label="wrong answers">{wrong}</span>
          </span>
          <span className="text-muted">
            {current}/{total}
          </span>
        </div>
      </div>
      <div className="h-1 bg-border">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}
