// 取り込むファイルの誤りの一覧。1行に、問題（ID）・項目・内容を並べる（docs/ui.md の「取り込むファイルの誤り」）
export function ErrorList({
  errors,
}: {
  errors: { id: string; item: string; message: string }[];
}) {
  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-surface">
      {errors.map((error, index) => (
        <li
          // 同じ問題の同じ項目に、誤りが2つ出ることもあるので、並び順も入れる
          key={`${index}-${error.id}-${error.item}`}
          className="flex flex-col gap-1 px-4 py-2.5 text-sm sm:flex-row sm:items-baseline sm:gap-0"
        >
          <span className="font-mono sm:w-23 sm:shrink-0">{error.id}</span>
          <span className="font-mono text-xs text-muted sm:w-27 sm:shrink-0">
            {error.item}
          </span>
          <span>{error.message}</span>
        </li>
      ))}
    </ul>
  );
}
