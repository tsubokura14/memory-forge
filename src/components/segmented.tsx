// 少しの中から1つ選ぶもの（docs/ui.md の「選ぶもの」の、横に並べたボタン）。Setup の順番と問題数で使う
export function Segmented<T>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex gap-1 rounded-md bg-surface-raised p-1"
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
            className={`flex-1 rounded-sm border py-1.5 font-mono text-sm ${checked ? "border-border bg-surface text-text" : "border-transparent text-muted"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
