// ボタン。primary は画面の主な操作（1画面に1つ）、outline はほかの操作（docs/ui.md の「ボタン」）。
// danger は、danger の帯の中に置く操作（retry）
const VARIANTS = {
  primary: "bg-primary text-on-primary",
  outline: "border border-border bg-surface",
  danger: "border border-danger text-danger",
};

// lg は、幅いっぱいに大きく置く操作（Setup の start、解く画面の下に固定した操作）
const SIZES = {
  md: "px-4 py-2",
  lg: "w-full px-4 py-3",
};

// lg の outline は、下に固定した操作の脇の操作（skip など）なので、主な操作より小さい muted の文字にする
function textClass(variant: keyof typeof VARIANTS, size: keyof typeof SIZES) {
  if (variant === "outline") {
    return size === "lg" ? "text-sm text-muted" : "text-sm text-text";
  }
  return size === "lg" ? "text-base font-medium" : "text-sm";
}

// リンク（Next.js の Link）を、ボタンと同じ見た目にするときに使う
export function buttonClass(
  variant: keyof typeof VARIANTS = "primary",
  size: keyof typeof SIZES = "md",
) {
  return `rounded-md font-mono disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${textClass(variant, size)}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}) {
  return (
    <button
      className={`${buttonClass(variant, size)} ${className}`}
      {...props}
    />
  );
}
