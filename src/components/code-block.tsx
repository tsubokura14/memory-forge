import { highlight, type CodeKind } from "@/server/questions/highlight";

const KIND_CLASS: Record<CodeKind, string> = {
  keyword: "text-code-keyword",
  string: "text-code-string",
  function: "text-code-function",
  builtin: "text-code-builtin",
  decorator: "text-code-decorator",
  comment: "text-code-comment",
};

// コードブロック（docs/ui.md の「コードブロック」）。問題文のコードには行番号を付け、選択肢と解説のコードには付けない。
// 色は language に合わせて付ける。色の切れ目は行をまたぐことがあるので、行番号はコードを改行で分けた数で出す
export function CodeBlock({
  code,
  language,
  lineNumbers = false,
}: {
  code: string;
  language: string;
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
        <code>
          {highlight(code, language).map((segment, i) =>
            segment.kind ? (
              <span key={i} className={KIND_CLASS[segment.kind]}>
                {segment.text}
              </span>
            ) : (
              segment.text
            ),
          )}
        </code>
      </pre>
    </div>
  );
}
