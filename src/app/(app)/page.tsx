import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { buttonClass } from "@/components/button";
import { hasSubjects } from "@/server/subjects/subjects";

// Home。今は、Subject が0件のときの Import への入り口と、menu の manage だけ（Subject の一覧は #6）
export default function Home() {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-8 px-4 pt-6 pb-10">
      <Suspense fallback={<EmptySubjectsSkeleton />}>
        <EmptySubjects />
      </Suspense>
      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs text-muted">menu</h2>
        <Link
          href="/manage"
          className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-4 py-3"
        >
          <span className="flex flex-col gap-0.5">
            <span className="font-mono text-sm">manage</span>
            <span className="text-xs text-muted">
              Import, export, delete, flagged
            </span>
          </span>
          <span aria-hidden className="icon text-lg text-muted">
            chevron_right
          </span>
        </Link>
      </section>
    </main>
  );
}

// Subject があるときは、見出しごと出さない
async function EmptySubjects() {
  // ビルドのときにデータベースを読まず、開くたびに読む
  await connection();
  if (await hasSubjects()) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-xs text-muted">subjects</h2>
      <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-border bg-surface px-4 py-10 text-center">
        <p className="text-base">No subjects yet.</p>
        <p className="text-sm text-muted">
          Import a question file to get started.
        </p>
        <Link href="/manage/import" className={`mt-3 ${buttonClass()}`}>
          import
        </Link>
      </div>
    </section>
  );
}

// docs/ui.md の「読み込み中」。0件の表示と同じ形の枠を点滅させる
function EmptySubjectsSkeleton() {
  return <div className="h-40 animate-pulse rounded-md bg-surface-raised" />;
}
