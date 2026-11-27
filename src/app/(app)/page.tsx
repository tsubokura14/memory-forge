import { Icon } from "@/components/icons";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { buttonClass } from "@/components/button";
import { DayStreakLine } from "@/components/day-streak";
import { EmptyState } from "@/components/empty-state";
import { MasteryAccuracy, MasteryBar } from "@/components/mastery";
import { RetryButton } from "@/components/retry-button";
import { now } from "@/server/clock";
import { mastery } from "@/server/mastery/mastery";
import { getDayStreak } from "@/server/streak/streak";
import {
  type ContinueSubject,
  getContinueSubject,
} from "@/server/subjects/continue";
import { listSubjects } from "@/server/subjects/subjects";

// Home。上から「続きから」のカード（右上に連続日数）、科目、設定
export default function Home() {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
      {/* 「続きから」は科目の一覧と同じ読み込みにし、一覧を読み込み中・読み込めないときはカードを出さない */}
      <Suspense
        fallback={
          <section className="flex flex-col gap-2">
            <SubjectsHeading />
            <SubjectsSkeleton />
          </section>
        }
      >
        <SubjectsAndContinue />
      </Suspense>
      <Link href="/settings" className="self-start text-sm text-muted">
        設定
      </Link>
    </main>
  );
}

async function SubjectsAndContinue() {
  // ビルドのときにデータベースを読まず、開くたびに読む
  await connection();
  let subjects: Awaited<ReturnType<typeof listSubjects>>;
  let next: ContinueSubject | null;
  try {
    [subjects, next] = await Promise.all([
      listSubjects(),
      getContinueSubject(),
    ]);
  } catch {
    return (
      <section className="flex flex-col gap-2">
        <SubjectsHeading />
        <Banner action={<RetryButton />}>科目を読み込めませんでした。</Banner>
      </section>
    );
  }

  return (
    <>
      {next && <ContinueCard subject={next} />}
      <section className="flex flex-col gap-2">
        <SubjectsHeading />
        <Subjects subjects={subjects} />
      </section>
    </>
  );
}

function ContinueCard({ subject }: { subject: ContinueSubject }) {
  return (
    <section
      aria-labelledby="continue-heading"
      className="mb-2 flex flex-col rounded-md border border-border p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="continue-heading" className="text-xs font-bold text-muted">
          続きから
        </h2>
        {/* 連続日数は「続きから」とは別に読み込み、読み込み中は何も出さない */}
        <Suspense fallback={null}>
          <DayStreakSection />
        </Suspense>
      </div>
      <p className="mt-3 text-lg font-bold break-words">{subject.name}</p>
      <p className="text-sm text-muted">
        {subject.remaining}問がまだ身についていません
      </p>
      <Link
        href={`/subjects/${subject.id}`}
        className={`mt-5 text-center ${buttonClass("primary", "lg")}`}
      >
        解きはじめる
      </Link>
    </section>
  );
}

// 開いたときにサーバーで1回だけ組み立てる。開いたまま日付が変わっても変えない
async function DayStreakSection() {
  await connection();
  let streak: Awaited<ReturnType<typeof getDayStreak>>;
  try {
    streak = await getDayStreak(now());
  } catch {
    return <p className="text-xs text-muted">連続日数を読み込めませんでした</p>;
  }
  return <DayStreakLine streak={streak} />;
}

function SubjectsHeading() {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-xs font-bold text-muted">科目</h2>
      <Link href="/manage" className="text-sm text-muted">
        問題の管理
      </Link>
    </div>
  );
}

function Subjects({
  subjects,
}: {
  subjects: Awaited<ReturnType<typeof listSubjects>>;
}) {
  if (subjects.length === 0) {
    return (
      <EmptyState
        title="まだ科目がありません。"
        description="問題のファイルを取り込むと、ここに科目が並びます。"
      >
        <Link href="/manage/import" className={`mt-3 ${buttonClass()}`}>
          取り込む
        </Link>
      </EmptyState>
    );
  }

  return (
    <ul
      aria-label="科目"
      className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-bg"
    >
      {subjects.map((subject) => {
        const m = mastery(subject);
        return (
          <li key={subject.id}>
            {/* 長い名前は折り返し、% と印は縦の真ん中のまま */}
            <Link
              href={`/subjects/${subject.id}`}
              className="flex items-center gap-4 px-4 py-3 text-base hover:bg-surface"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="break-words">{subject.name}</span>
                {/* Home では印の数を出さない（印は Setup と Manage で見る） */}
                <MasteryBar mastery={m} />
              </span>
              <MasteryAccuracy accuracy={m.accuracy} />
              {/* 印の行の高さで行が高くならないように、行の高さを文字の大きさにそろえる */}
              <Icon
                name="chevron-right"
                className="shrink-0 text-lg leading-none text-muted"
              />
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
          className="h-20 rounded-md border border-border bg-surface"
        />
      ))}
    </div>
  );
}
