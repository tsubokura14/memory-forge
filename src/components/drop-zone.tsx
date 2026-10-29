"use client";

import { useRef } from "react";
import { Button } from "./button";

// ファイルを落とすか選ぶ、点線の枠（docs/ui.md の「0件」と同じ点線の枠）。busy の間は、選ぶボタンを出さず、落としても受け取らない
export function DropZone({
  accept,
  hint,
  busy = false,
  onFile,
  children,
}: {
  accept: string;
  hint: string;
  busy?: boolean;
  onFile: (file: File) => void;
  children?: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div
      // ブラウザがファイルを開いてしまわないよう、重ねたときの既定の動きを止める
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (!busy && file) onFile(file);
      }}
      className={`flex flex-col items-center gap-1 rounded-md border border-dashed bg-surface border-border px-4 py-10 text-center`}
    >
      {children ?? (
        <>
          <p className="text-base">Drop a question file here</p>
          <p className="font-mono text-xs text-muted">{hint}</p>
          <Button
            type="button"
            className="mt-3"
            onClick={() => input.current?.click()}
          >
            choose file
          </Button>
          <input
            ref={input}
            type="file"
            accept={accept}
            data-testid="file-input"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              // 同じファイルをもう一度選んでも onChange が起きるよう、選んだものを空にしておく
              event.target.value = "";
              if (file) onFile(file);
            }}
          />
        </>
      )}
    </div>
  );
}
