// 中身の幅のカード（docs/ui.md の「中身の幅」。ログインとパスワードの再設定で使う）
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm rounded-md border border-border bg-surface p-5">
      {children}
    </div>
  );
}
