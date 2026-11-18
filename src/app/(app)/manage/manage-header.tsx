import Link from "next/link";
import { buttonClass } from "@/components/button";
import { PageHeader } from "@/components/page-header";

// Manage の上。戻るリンク・見出しと説明、右に取り込むと、選んでいる Subject の export（children）を並べる。
// export は選んでいる Subject がわかってから出すので、一覧と一緒に組み立てる（manage-view.tsx）
export function ManageHeader({ children }: { children?: React.ReactNode }) {
  return (
    // スマホの幅では、ボタンを見出しの下に置く
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <PageHeader
        back={{ href: "/", label: "ホームへ戻る" }}
        title="問題の管理"
      >
        <p className="text-sm text-muted">
          問題の取り込み・書き出し・削除をします。
        </p>
      </PageHeader>
      <div className="flex gap-2 self-start sm:self-auto">
        <Link href="/manage/import" className={buttonClass()}>
          取り込む
        </Link>
        {children}
      </div>
    </div>
  );
}
