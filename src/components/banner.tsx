// 帯。danger は誤り（読み込み・保存のエラーなど）、success は答え合わせの正解（解く画面の結果の帯）。
// action には、右に置くボタン（読み込みのエラーの retry など）を渡す
const TONES = {
  danger: "border-danger bg-danger-soft text-danger",
  success: "border-success bg-success-soft text-success",
};

export function Banner({
  children,
  action,
  tone = "danger",
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm ${TONES[tone]}`}
    >
      <div>{children}</div>
      {action}
    </div>
  );
}
