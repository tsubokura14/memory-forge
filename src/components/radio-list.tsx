// 一覧から1つ選ぶもの（docs/ui.md の「選ぶもの」の、丸の付いた行）。Setup の Topic で使う
export function RadioList<T>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; strong?: boolean }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-surface"
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-3 px-4 py-3 text-left text-sm ${checked ? "bg-primary-soft" : "hover:bg-surface-raised"}`}
          >
            <span
              aria-hidden
              className={`size-4 shrink-0 rounded-full border-2 ${checked ? "border-primary bg-primary" : "border-muted"}`}
            />
            <span className={option.strong ? "font-semibold" : ""}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
