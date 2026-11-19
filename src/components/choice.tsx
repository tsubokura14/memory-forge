import { parseMarkup } from "@/server/questions/markup";
import { RichText } from "./rich-text";

// 答え合わせのあとの選択肢の見え方（docs/ui.md の「答え合わせのあと」）。
// hit は選んだ正解、wrong は選んで間違えた選択肢、missed は選ばなかった正解。ほかは null
export type ChoiceMark = "hit" | "wrong" | "missed" | null;

// 答えたあとの状態は、見た目は地の色だけなので、読み上げ用の文字でも伝える
const MARK_LABELS = {
  hit: "選んだ答え・正解",
  wrong: "選んだ答え・不正解",
  missed: "正解",
};

// 選択肢のカード（docs/ui.md の「選択肢」）。枠線を付けず、状態は地の色で出す。単一選択は丸い記号、複数選択は四角い記号
export function Choice({
  letter,
  text,
  multiple,
  selected,
  mark,
  disabled,
  onClick,
}: {
  letter: string;
  text: string;
  multiple: boolean;
  selected: boolean;
  // 答える前は undefined
  mark?: ChoiceMark;
  disabled?: boolean;
  onClick: () => void;
}) {
  const before = mark === undefined;
  const row =
    mark === "hit" || mark === "missed"
      ? "bg-success-soft"
      : mark === "wrong"
        ? "bg-danger-soft"
        : before && selected
          ? "bg-primary-soft"
          : `bg-surface-raised ${before && !disabled ? "hover:bg-primary-soft" : ""}`;
  const badge =
    mark === "hit"
      ? "bg-success/30 text-success"
      : mark === "missed"
        ? "bg-success/15 text-success"
        : mark === "wrong"
          ? "bg-danger/30 text-danger"
          : before && selected
            ? "bg-primary text-on-primary"
            : "bg-bg text-muted";
  // コードブロックのある選択肢は、スマホの幅では記号を上の行に置き、コードを幅いっぱいに出す
  const hasCode = parseMarkup(text).some((block) => block.kind === "code");
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex gap-3 rounded-md px-4 py-3 text-left text-sm transition-colors duration-300 ${hasCode ? "flex-col sm:flex-row sm:items-start" : "items-start"} ${row}`}
    >
      <span
        className={`flex size-6 shrink-0 items-center justify-center text-xs font-bold ${multiple ? "rounded-sm" : "rounded-full"} ${badge}`}
      >
        {letter}
      </span>
      <span
        className={`min-w-0 flex-1 ${hasCode ? "self-stretch sm:self-center" : "self-center"}`}
      >
        <RichText text={text} />
      </span>
      {mark && <span className="sr-only">{` ${MARK_LABELS[mark]}`}</span>}
    </button>
  );
}
