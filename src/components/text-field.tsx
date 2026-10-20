import { useId } from "react";

// ラベル付きの入力。invalid のときは枠を danger にする
export function TextField({
  label,
  invalid = false,
  ...props
}: React.ComponentProps<"input"> & { label: string; invalid?: boolean }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs text-muted">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={invalid || undefined}
        className={`rounded-md border bg-bg px-3 py-2 font-mono text-sm text-text ${invalid ? "border-danger" : "border-border"}`}
        {...props}
      />
    </div>
  );
}
