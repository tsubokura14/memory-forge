// 数の枠。上に等幅の数、下にラベル。数の色は呼ぶ側が決める（取り込む前の確認の new・replaced・unchanged、解き終わりの結果の4つの数）
export function CountBox({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "success" | "warning" | "danger" | "muted";
}) {
  const color = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    muted: "text-muted",
  }[tone];
  return (
    <div
      data-testid={`count-${label}`}
      className="flex flex-col gap-1 rounded-md border border-border bg-surface px-4 py-3"
    >
      <span className={`font-mono text-lg ${color}`}>{count}</span>
      <span className="font-mono text-xs text-muted">{label}</span>
    </div>
  );
}
