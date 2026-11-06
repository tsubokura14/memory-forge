import { cookies } from "next/headers";
import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { EmptyState } from "@/components/empty-state";
import { RetryButton } from "@/components/retry-button";
import { getManage, type Manage } from "@/server/manage/list";
import { parseSaved } from "@/server/manage/selection";
import { MANAGE_COOKIE } from "./cookie";
import { ManageHeader } from "./manage-header";
import { ManageView, QuestionsSkeleton } from "./manage-view";

// Manage。上に戻るリンク・見出し・import と export、その下に絞り込みと問題の一覧
export default function ManagePage() {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
      <Suspense
        fallback={
          <>
            <ManageHeader />
            <QuestionsSkeleton />
          </>
        }
      >
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
      <>
        <ManageHeader />
        <Banner action={<RetryButton />}>Couldn&apos;t load questions.</Banner>
      </>
    );
  }

  if (!manage.selected) {
    return (
      <>
        <ManageHeader />
        <EmptyState
          title="No subjects yet."
          description="Import a question file to get started."
        />
      </>
    );
  }
  return <ManageView subjects={manage.subjects} selected={manage.selected} />;
}
