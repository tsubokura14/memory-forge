import { Icon } from "@/components/icons";
import { RichText } from "./rich-text";

// 置き換わる問題の、開閉する行。行に ID と問題文の1行目（印が付いていたら、右に印と記録が消えること）、開くと変わった項目ごとに前（danger）と後（success）を並べる。
// スマホの幅では、前と後を縦に並べる
export function ChangeRow({
  id,
  text,
  flagged,
  changes,
  defaultOpen = false,
}: {
  id: string;
  text: string;
  flagged: boolean;
  changes: {
    item: string;
    before: string;
    after: string;
    beforeHtml?: string;
    afterHtml?: string;
  }[];
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-md border border-border bg-bg"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm">
        <span aria-hidden className="flex text-base text-muted">
          <Icon name="chevron-right" className="group-open:hidden" />
          {/* Icon が inline-block を付け、それが hidden より CSS の後ろに来て勝つので、隠すほうを変化形にする */}
          <Icon name="chevron-down" className="group-not-open:hidden" />
        </span>
        <span>{id}</span>
        <span className="truncate">{text.split("\n")[0]}</span>
        {flagged && (
          <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-warning">
            <Icon name="flag" className="text-base leading-none" />
            印と記録をリセット
          </span>
        )}
      </summary>
      <div className="flex flex-col gap-4 border-t border-border px-4 py-3">
        {changes.map((change) => (
          <div key={change.item} className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">{change.item}</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Side
                label="前"
                value={change.before}
                html={change.beforeHtml}
                item={change.item}
                tone="danger"
              />
              <Side
                label="後"
                value={change.after}
                html={change.afterHtml}
                item={change.item}
                tone="success"
              />
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

// 問題文・選択肢・解説は、サーバーで変換した HTML（src/server/import/import.ts）を Solve と同じ kinari-md の見た目で出す。
// 選択肢は Solve の選択肢と同じ書体にする。topic・type・correct は HTML がないので文字のまま出す
function Side({
  label,
  value,
  html,
  item,
  tone,
}: {
  label: string;
  value: string;
  html: string | undefined;
  item: string;
  tone: "danger" | "success";
}) {
  const colors = {
    danger: { box: "border-danger bg-danger-soft", label: "text-danger" },
    success: { box: "border-success bg-success-soft", label: "text-success" },
  }[tone];
  return (
    <div
      className={`flex min-w-0 flex-col gap-1 rounded-md border px-3 py-2 ${colors.box}`}
    >
      <span className={`text-xs ${colors.label}`}>{label}</span>
      {html !== undefined ? (
        <RichText
          html={html}
          body={item.startsWith("choice ") ? "preview-choice" : "preview"}
        />
      ) : (
        <span className="text-sm break-words whitespace-pre-wrap">{value}</span>
      )}
    </div>
  );
}
