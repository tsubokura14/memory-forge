import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { buttonClass } from "@/components/button";
import { DayStreakCard } from "@/components/day-streak";
import { EmptyState } from "@/components/empty-state";
import { MasteryAccuracy, MasteryBar } from "@/components/mastery";
import { RetryButton } from "@/components/retry-button";
import { now } from "@/server/clock";
import { mastery } from "@/server/mastery/mastery";
import { getDayStreak } from "@/server/streak/streak";
import { listSubjects } from "@/server/subjects/subjects";

// Home。上から day streak、menu、subjects
export default function Home() {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs text-muted">day streak</h2>
        {/* Subject の一覧とは別に読み込み、別に失敗を出す */}
        <Suspense fallback={<DayStreakSkeleton />}>
          <DayStreakSection />
        </Suspense>
      </section>
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

// 開いたときにサーバーで1回だけ組み立てる。開いたまま日付が変わっても変えない
async function DayStreakSection() {
  await connection();
  let streak: Awaited<ReturnType<typeof getDayStreak>>;
  try {
    streak = await getDayStreak(now());
  } catch {
    return (
      <Banner action={<RetryButton />}>Couldn&apos;t load day streak.</Banner>
    );
  }
  return <DayStreakCard streak={streak} />;
}

// docs/ui.md の「読み込み中」。連続日数の枠と同じ高さの枠を1つ点滅させる
function DayStreakSkeleton() {
  return (
    <div
      data-testid="day-streak-loading"
      className="h-36 animate-pulse rounded-md border border-border bg-surface-raised"
    />
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
      <EmptyState
        title="No subjects yet."
        description="Import a question file to get started."
      >
        <Link href="/manage/import" className={`mt-3 ${buttonClass()}`}>
          import
        </Link>
      </EmptyState>
    );
  }

  return (
    <ul
      aria-label="subjects"
      className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-surface"
    >
      {subjects.map((subject) => {
        const m = mastery(subject);
        return (
          <li key={subject.id}>
            {/* 長い名前は折り返し、% と印は縦の真ん中のまま */}
            <Link
              href={`/subjects/${subject.id}`}
              className="flex items-center gap-4 px-4 py-3 text-base hover:bg-surface-raised"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="break-words">{subject.name}</span>
                {/* Home では印の数を出さない（印は Setup と Manage で見る） */}
                <MasteryBar mastery={m} />
              </span>
              <MasteryAccuracy accuracy={m.accuracy} />
              {/* 印の行の高さで行が高くならないように、行の高さを文字の大きさにそろえる */}
              <span
                aria-hidden
                className="icon shrink-0 text-lg leading-none text-muted"
              >
                chevron_right
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// docs/ui.md の「読み込み中」。Subject の行（名前・線・数）と同じ高さの枠を4つ点滅させる
function SubjectsSkeleton() {
  return (
    <div
      data-testid="subjects-loading"
      className="flex animate-pulse flex-col gap-2"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="h-20 rounded-md border border-border bg-surface-raised"
        />
      ))}
    </div>
  );
}
