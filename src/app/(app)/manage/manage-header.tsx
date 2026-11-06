import Link from "next/link";
import { buttonClass } from "@/components/button";
import { PageHeader } from "@/components/page-header";

// Manage の上。戻るリンク・見出しと説明、右に import と、選んでいる Subject の export（children）を並べる。
// export は選んでいる Subject がわかってから出すので、一覧と一緒に組み立てる（manage-view.tsx）
export function ManageHeader({ children }: { children?: React.ReactNode }) {
  return (
    // スマホの幅では、ボタンを見出しの下に置く
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <PageHeader back={{ href: "/", label: "home" }} title="Manage">
        <p className="text-sm text-muted">
          Import, export and delete questions.
        </p>
      </PageHeader>
      <div className="flex gap-2 self-start sm:self-auto">
        <Link href="/manage/import" className={buttonClass()}>
          import
        </Link>
        {children}
      </div>
    </div>
  );
}
