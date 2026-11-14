import { parseMarkup } from "@/server/questions/markup";
import { CodeBlock } from "./code-block";

// 問題文・選択肢・解説。文の中のコードは code-bg で囲み、``` のところはコードブロックにする（docs/ui.md の「文の中のコード」）
export function RichText({
  text,
  lineNumbers = false,
}: {
  text: string;
  lineNumbers?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {parseMarkup(text).map((block, i) =>
        block.kind === "code" ? (
          <CodeBlock
            key={i}
            code={block.code}
            language={block.language}
            lineNumbers={lineNumbers}
          />
        ) : (
          <p key={i} className="whitespace-pre-wrap">
            {block.inlines.map((inline, j) =>
              inline.kind === "code" ? (
                <code
                  key={j}
                  className="rounded-sm bg-code-bg px-1 font-mono text-sm text-code-text"
                >
                  {inline.text}
                </code>
              ) : (
                inline.text
              ),
            )}
          </p>
        ),
      )}
    </div>
  );
}
