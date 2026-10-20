// ロゴ。アプリ名の左に、hardware のアイコンを45度傾けて置く（docs/ui.md の「ロゴ」）。
// Login では大きく（lg）、上のバーでは小さく（sm）出す。
// sm のアイコンは、文字と同じ大きさだとプロトタイプより小さく見えるので lg にし、バーが高くならないよう行の高さを1にする
const SIZES = {
  lg: { text: "text-lg", icon: "text-lg" },
  sm: { text: "text-sm", icon: "text-lg leading-none" },
};

export function Logo({ size = "lg" }: { size?: keyof typeof SIZES }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-text ${SIZES[size].text}`}
    >
      <span
        aria-hidden
        className={`icon rotate-45 text-primary ${SIZES[size].icon}`}
      >
        hardware
      </span>
      memory-forge
    </span>
  );
}
