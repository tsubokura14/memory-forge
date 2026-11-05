// 0件の表示（docs/ui.md の「状態の見せ方」）。点線の枠の中に、短い説明と、次にすることのボタン（あれば。上に mt-3 の間を空けて渡す）を出す
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-border px-4 py-10 text-center">
      <p className="text-base">{title}</p>
      <p className="text-sm text-muted">{description}</p>
      {children}
    </div>
  );
}
