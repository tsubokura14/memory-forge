import { Icon } from "@/components/icons";

// Result の「間違えた問題」の行。左に danger の x（不正解も飛ばしたものも同じ）、問題文の1行目（明朝。長いときは折り返す）と Topic、右に chevron-right。
// 押すと onClick（見直しを開く）
export function MissedRow({
  text,
  topic,
  onClick,
}: {
  text: string;
  topic: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-raised"
      >
        <Icon name="x" className="mt-1 shrink-0 text-base text-danger" />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-body text-base">{text.split("\n")[0]}</span>
          <span className="text-xs text-muted">{topic}</span>
        </span>
        <Icon
          name="chevron-right"
          className="mt-1 shrink-0 self-center text-base text-muted"
        />
      </button>
    </li>
  );
}
