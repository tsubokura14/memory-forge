// ボタン。primary は画面の主な操作（1画面に1つ）、outline はほかの操作（docs/ui.md の「ボタン」）。
// danger は、danger の帯の中に置く操作（retry）。
// 取り消せない操作（docs/ui.md の「取り消せない操作（削除）」）は3つ。destructive は確認のダイアログの delete、
// deleteIcon はプルダウンの右の delete の印だけのボタン（size は icon）、deleteText は一覧の行の delete（size は sm）。
// flag は解く画面の問題に印を付ける操作（size は sm）、flagged は印を付けたあとの同じボタン
const VARIANTS = {
  primary: "bg-primary text-on-primary",
  outline: "border border-border bg-surface",
  danger: "border border-danger text-danger",
  destructive: "bg-danger text-on-primary",
  deleteIcon:
    "border border-border bg-surface hover:border-danger hover:text-danger",
  deleteText: "hover:bg-danger-soft hover:text-danger",
  flag: "hover:bg-warning-soft hover:text-warning",
  flagged: "bg-warning-soft text-warning",
};

// lg は、幅いっぱいに大きく置く操作（Setup の start、解く画面の下に固定した操作）。
// icon は、プルダウンと同じ高さの正方形
const SIZES = {
  md: "px-4 py-2",
  lg: "w-full px-4 py-3",
  sm: "px-2 py-1",
  icon: "flex size-8.5 shrink-0 items-center justify-center",
};

// lg の outline は、下に固定した操作の脇の操作（skip など）なので、主な操作より小さい muted の文字にする
function textClass(variant: keyof typeof VARIANTS, size: keyof typeof SIZES) {
  if (variant === "deleteIcon") return "text-muted";
  if (variant === "deleteText") return "text-xs text-muted";
  if (variant === "flag") return "text-sm text-muted";
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
