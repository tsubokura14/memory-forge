import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { buttonClass } from "@/components/button";
import { RetryButton } from "@/components/retry-button";
import { listSubjects } from "@/server/subjects/subjects";

// Home。上に menu、下に subjects
export default function Home() {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs text-muted">menu</h2>
        {/* manage は、2列の枠の左の1枚の大きさにする */}
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/manage"
            className="flex flex-col gap-0.5 rounded-md border border-border bg-surface px-3 py-3 hover:bg-surface-raised"
          >
            <span className="font-mono text-sm">manage</span>
            <span className="text-xs text-muted">
              Import, export, delete, flagged
            </span>
          </Link>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs text-muted">subjects</h2>
        <Suspense fallback={<SubjectsSkeleton />}>
          <Subjects />
        </Suspense>
      </section>
    </main>
  );
}

async function Subjects() {
  // ビルドのときにデータベースを読まず、開くたびに読む
  await connection();
  let subjects: Awaited<ReturnType<typeof listSubjects>>;
  try {
    subjects = await listSubjects();
  } catch {
    return (
      <Banner action={<RetryButton />}>Couldn&apos;t load subjects.</Banner>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-border bg-surface px-4 py-10 text-center">
        <p className="text-base">No subjects yet.</p>
        <p className="text-sm text-muted">
          Import a question file to get started.
        </p>
        <Link href="/manage/import" className={`mt-3 ${buttonClass()}`}>
          import
        </Link>
      </div>
    );
  }

  return (
    <ul
      aria-label="subjects"
      className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-surface"
    >
      {subjects.map((subject) => (
        <li key={subject.id}>
          {/* 長い名前は折り返し、印は縦の真ん中のまま */}
          <Link
            href={`/subjects/${subject.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 text-base hover:bg-surface-raised"
          >
            <span className="min-w-0 break-words">{subject.name}</span>
            {/* 印の行の高さで行が高くならないように、行の高さを文字の大きさにそろえる */}
            <span
              aria-hidden
              className="icon shrink-0 text-lg leading-none text-muted"
            >
              chevron_right
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// docs/ui.md の「読み込み中」。Subject の行の形の枠を4つ点滅させる
function SubjectsSkeleton() {
  return (
    <div
      data-testid="subjects-loading"
      className="flex animate-pulse flex-col gap-2"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="h-16 rounded-md border border-border bg-surface-raised"
        />
      ))}
    </div>
  );
}
