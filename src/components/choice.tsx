import { RichText } from "./rich-text";

// 答え合わせのあとの選択肢の見え方（docs/ui.md の「答え合わせのあと」）。
// hit は選んだ正解、wrong は選んで間違えた選択肢、missed は選ばなかった正解。ほかは null
export type ChoiceMark = "hit" | "wrong" | "missed" | null;

// 選択肢の行（docs/ui.md の「選択肢」）。単一選択は丸い記号、複数選択は四角い記号
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
  const row =
    mark === "hit" || mark === "missed"
      ? "border-success bg-success-soft"
      : mark === "wrong"
        ? "border-danger bg-danger-soft"
        : mark === undefined && selected
          ? "border-primary bg-primary-soft"
          : "border-border bg-surface";
  const badge =
    mark === "hit"
      ? "border-success bg-success text-on-primary"
      : mark === "wrong"
        ? "border-danger bg-danger text-on-primary"
        : mark === "missed"
          ? "border-success text-success"
          : mark === undefined && selected
            ? "border-primary bg-primary text-on-primary"
            : "border-border text-muted";
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-start gap-3 rounded-md border px-3 py-3 text-left font-mono text-sm ${row}`}
    >
      <span
        className={`flex size-6 shrink-0 items-center justify-center border font-mono text-xs ${multiple ? "rounded-sm" : "rounded-full"} ${badge}`}
      >
        {letter}
      </span>
      <span className="min-w-0 flex-1 self-center">
        <RichText text={text} />
      </span>
      {mark === "missed" && (
        <span className="shrink-0 self-center font-mono text-xs text-success">
          missed
        </span>
      )}
    </button>
  );
}
