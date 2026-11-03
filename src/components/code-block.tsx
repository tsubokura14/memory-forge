// コードブロック（docs/ui.md の「コードブロック」）。問題文のコードには行番号を付け、選択肢と解説のコードには付けない。
// 色分けは #7 で足す
export function CodeBlock({
  code,
  lineNumbers = false,
}: {
  code: string;
  lineNumbers?: boolean;
}) {
  const lines = code.split("\n");
  return (
    <div className="flex overflow-hidden rounded-md border border-border bg-code-bg font-mono text-sm text-code-text">
      {lineNumbers && (
        <div
          aria-hidden
          className="shrink-0 border-r border-border px-3 py-3 text-right text-code-line select-none"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      )}
      <pre className="min-w-0 flex-1 overflow-x-auto px-4 py-3">
        <code>{code}</code>
      </pre>
    </div>
  );
}
