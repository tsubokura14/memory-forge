// 帯。今は誤りを伝える danger だけを使う
export function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      {children}
    </div>
  );
}
