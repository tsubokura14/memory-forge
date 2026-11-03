// 正答率の円（docs/ui.md の「解き終わりの結果」）。success の線が、正答率の割合だけ12時から右回りに伸びる。
// 真ん中に % と accuracy
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function AccuracyRing({ accuracy }: { accuracy: number }) {
  return (
    <div className="relative size-32">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          className="stroke-surface-raised"
        />
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - accuracy / 100)}
          className="stroke-success"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg">{accuracy}%</span>
        <span className="font-mono text-xs text-muted">accuracy</span>
      </div>
    </div>
  );
}
