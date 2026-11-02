// ボタン。primary は画面の主な操作（1画面に1つ）、outline はほかの操作（docs/ui.md の「ボタン」）。
// danger は、danger の帯の中に置く操作（retry）
const VARIANTS = {
  primary: "bg-primary text-on-primary",
  outline: "border border-border bg-surface text-text",
  danger: "border border-danger text-danger",
};

// lg は、幅いっぱいに大きく置く主な操作（Setup の start、解く画面の下に固定した操作）
const SIZES = {
  md: "px-4 py-2 text-sm",
  lg: "w-full px-4 py-3 text-base",
};

// リンク（Next.js の Link）を、ボタンと同じ見た目にするときに使う
export function buttonClass(
  variant: keyof typeof VARIANTS = "primary",
  size: keyof typeof SIZES = "md",
) {
  return `rounded-md font-mono disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]}`;
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
