import Link from "next/link";
import { PageHeader } from "@/components/page-header";

// Manage。今は Import への入り口だけ（問題の一覧・書き出し・削除は #11）
export default function ManagePage() {
  return (
    <main className="mx-auto max-w-page px-4 pt-6 pb-10">
      <div className="flex items-end justify-between gap-4">
        <PageHeader back={{ href: "/", label: "home" }} title="Manage">
          <p className="text-sm text-muted">
            Import, export and delete questions.
          </p>
        </PageHeader>
        <Link
          href="/manage/import"
          className="rounded-md bg-primary px-4 py-2 font-mono text-sm text-on-primary"
        >
          import
        </Link>
      </div>
    </main>
  );
}
