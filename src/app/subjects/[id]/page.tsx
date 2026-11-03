import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { signOutAction } from "@/app/(app)/actions";
import { AppBar } from "@/components/app-bar";
import { Banner } from "@/components/banner";
import { PageHeader } from "@/components/page-header";
import { RetryButton } from "@/components/retry-button";
import { getSetup, type Setup } from "@/server/solve/setup";
import { BACK, KICKER, Main } from "./main";
import { Study } from "./study";

// Setup と Solve。上のバーは、ここ（と study.tsx）で出す（docs/design.md の「解く画面の状態」）
export default function SubjectPage({ params }: PageProps<"/subjects/[id]">) {
  return (
    <Suspense fallback={<SetupSkeleton />}>
      <SetupLoader params={params} />
    </Suspense>
  );
}

async function SetupLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ビルドのときにデータベースを読まず、開くたびに読む
  await connection();
  const subjectId = Number(id);
  if (!Number.isSafeInteger(subjectId) || subjectId <= 0) notFound();

  let setup: Setup | null;
  try {
    setup = await getSetup(subjectId);
  } catch {
    return (
      <>
        <AppBar signOutAction={signOutAction} />
        <Main>
          <PageHeader back={BACK} kicker={KICKER} />
          <Banner action={<RetryButton />}>
            Couldn&apos;t load this subject.
          </Banner>
        </Main>
      </>
    );
  }
  if (!setup) notFound();

  return <Study subjectId={subjectId} setup={setup} />;
}

// docs/ui.md の「読み込み中」。Subject の名前と、Topic の行の形の枠を6つ点滅させる
function SetupSkeleton() {
  return (
    <>
      <AppBar signOutAction={signOutAction} />
      <Main>
        <PageHeader
          back={BACK}
          kicker={KICKER}
          title={
            <span className="block h-7 w-32 animate-pulse rounded-sm bg-surface-raised" />
          }
        />
        <div
          data-testid="setup-loading"
          className="flex animate-pulse flex-col gap-2"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-14 rounded-md border border-border bg-surface-raised"
            />
          ))}
        </div>
      </Main>
    </>
  );
}
