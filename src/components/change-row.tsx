// 置き換わる問題の、開閉する行。行に ID と問題文の1行目、開くと変わった項目ごとに前（danger）と後（success）を並べる。
// スマホの幅では、前と後を縦に並べる
export function ChangeRow({
  id,
  text,
  changes,
  defaultOpen = false,
}: {
  id: string;
  text: string;
  changes: { item: string; before: string; after: string }[];
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-md border border-border bg-surface"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm">
        <span aria-hidden className="icon text-base text-muted">
          <span className="group-open:hidden">chevron_right</span>
          <span className="hidden group-open:inline">expand_more</span>
        </span>
        <span className="font-mono">{id}</span>
        <span className="truncate">{text.split("\n")[0]}</span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-border px-4 py-3">
        {changes.map((change) => (
          <div key={change.item} className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-muted">{change.item}</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Side label="before" value={change.before} tone="danger" />
              <Side label="after" value={change.after} tone="success" />
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function Side({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "danger" | "success";
}) {
  const colors = {
    danger: { box: "border-danger bg-danger-soft", label: "text-danger" },
    success: { box: "border-success bg-success-soft", label: "text-success" },
  }[tone];
  return (
    <div
      className={`flex flex-col gap-1 rounded-md border px-3 py-2 ${colors.box}`}
    >
      <span className={`font-mono text-xs ${colors.label}`}>{label}</span>
      <span className="font-mono text-sm break-words whitespace-pre-wrap">
        {value}
      </span>
    </div>
  );
}
