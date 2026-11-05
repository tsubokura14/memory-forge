import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { buttonClass } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RetryButton } from "@/components/retry-button";
import { getManage, type Manage } from "@/server/manage/list";
import { parseSaved } from "@/server/manage/selection";
import { MANAGE_COOKIE } from "./cookie";
import { ManageView, QuestionsSkeleton } from "./manage-view";

// Manage。上に戻るリンク・見出し・import、その下に絞り込みと問題の一覧
export default function ManagePage() {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
      {/* スマホの幅では、ボタンを見出しの下に置く */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader back={{ href: "/", label: "home" }} title="Manage">
          <p className="text-sm text-muted">
            Import, export and delete questions.
          </p>
        </PageHeader>
        <Link
          href="/manage/import"
          className={`self-start sm:self-auto ${buttonClass()}`}
        >
          import
        </Link>
      </div>
      <Suspense fallback={<QuestionsSkeleton />}>
        <Questions />
      </Suspense>
    </main>
  );
}

async function Questions() {
  // cookie を読むので、ビルドのときにデータベースを読まず、開くたびに読む
  const saved = parseSaved((await cookies()).get(MANAGE_COOKIE)?.value);
  let manage: Manage;
  try {
    manage = await getManage(saved);
  } catch {
    return (
      <Banner action={<RetryButton />}>Couldn&apos;t load questions.</Banner>
    );
  }

  if (!manage.selected) {
    return (
      <EmptyState
        title="No subjects yet."
        description="Import a question file to get started."
      />
    );
  }
  return <ManageView subjects={manage.subjects} selected={manage.selected} />;
}
