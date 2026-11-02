import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { signOutAction } from "@/app/(app)/actions";
import { AppBar } from "@/components/app-bar";
import { Banner } from "@/components/banner";
import { PageHeader } from "@/components/page-header";
import { RetryButton } from "@/components/retry-button";
import { getSetup, type Setup } from "@/server/solve/setup";
import { SetupForm } from "./setup-form";

const BACK = { href: "/", label: "back" };
const KICKER = "study setup";

// Setup（と、T4 からは Solve）。Solve は上のバーが違うので、上のバーの付く (app) のまとまりの外に置き、ここで出す
export default function SubjectPage({ params }: PageProps<"/subjects/[id]">) {
  return (
    <>
      <AppBar signOutAction={signOutAction} />
      <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
        <Suspense fallback={<SetupSkeleton />}>
          <SetupLoader params={params} />
        </Suspense>
      </main>
    </>
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
        <PageHeader back={BACK} kicker={KICKER} />
        <Banner action={<RetryButton />}>
          Couldn&apos;t load this subject.
        </Banner>
      </>
    );
  }
  if (!setup) notFound();

  return (
    <>
      <PageHeader back={BACK} kicker={KICKER} title={setup.name} />
      <SetupForm setup={setup} />
    </>
  );
}

// docs/ui.md の「読み込み中」。Subject の名前と、Topic の行の形の枠を6つ点滅させる
function SetupSkeleton() {
  return (
    <>
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
          <div key={i} className="h-14 rounded-md bg-surface-raised" />
        ))}
      </div>
    </>
  );
}
