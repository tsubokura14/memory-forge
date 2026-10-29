// ボタン。primary は画面の主な操作（1画面に1つ）、outline はほかの操作（docs/ui.md の「ボタン」）。
// danger は、danger の帯の中に置く操作（retry）
const VARIANTS = {
  primary: "bg-primary text-on-primary",
  outline: "border border-border bg-surface text-text",
  danger: "border border-danger text-danger",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ComponentProps<"button"> & { variant?: keyof typeof VARIANTS }) {
  return (
    <button
      className={`rounded-md px-4 py-2 font-mono text-sm disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
