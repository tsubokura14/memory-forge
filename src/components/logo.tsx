// ロゴ。アプリ名の左に、hardware のアイコンを45度傾けて置く（docs/ui.md の「ロゴ」）
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-lg text-text">
      <span aria-hidden className="icon rotate-45 text-lg text-primary">
        hardware
      </span>
      memory-forge
    </span>
  );
}
