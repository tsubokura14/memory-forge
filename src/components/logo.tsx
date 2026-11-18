import { Icon } from "@/components/icons";

// ロゴ。アプリ名の左に、hammer のアイコンを傾けずに置く（docs/ui.md の「ロゴ」）。
// Login では大きく（lg）、上のバーでは小さく（sm）出す。
// sm のアイコンは、文字と同じ大きさだとプロトタイプより小さく見えるので lg にし、バーが高くならないよう行の高さを1にする
const SIZES = {
  lg: { text: "text-lg", icon: "text-lg" },
  sm: { text: "text-sm", icon: "text-lg leading-none" },
};

export function Logo({ size = "lg" }: { size?: keyof typeof SIZES }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-text ${SIZES[size].text}`}
    >
      <Icon name="hammer" className={`text-primary ${SIZES[size].icon}`} />
      memory-forge
    </span>
  );
}
