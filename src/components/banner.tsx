// 帯。今は誤りを伝える danger だけを使う。action には、右に置くボタン（読み込みのエラーの retry など）を渡す
export function Banner({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      <div>{children}</div>
      {action}
    </div>
  );
}
