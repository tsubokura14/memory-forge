import { Icon } from "@/components/icons";

// ロゴ。hammer のアイコン（傾けない）とアプリ名を並べる（docs/ui.md の「ロゴ」）。アプリ名は画面の部品の書体の太字。
// Login では大きく（lg）、アイコンを上に置いて縦に並べる。上のバーでは小さく（sm）、横に並べる
const SIZES = {
  lg: { box: "flex-col gap-3 text-lg", icon: "size-11" },
  sm: { box: "gap-2 text-base", icon: "text-lg" },
};

export function Logo({ size = "lg" }: { size?: keyof typeof SIZES }) {
  return (
    <span
      className={`inline-flex items-center font-bold text-text ${SIZES[size].box}`}
    >
      <Icon name="hammer" className={`text-primary ${SIZES[size].icon}`} />
      memory-forge
    </span>
  );
}
