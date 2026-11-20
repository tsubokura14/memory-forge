"use client";

import Link from "next/link";
import { signOutAction } from "@/app/(app)/actions";
import { AppBar } from "@/components/app-bar";
import { Button, buttonClass } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { TopicResultRow } from "@/components/topic-result-row";
import { MissedRow } from "@/components/missed-row";
import type { MissedQuestion, SessionResult } from "@/server/solve/result";

// 解き終わりの結果。戻るリンクは置かず、下の「ホームへ戻る」と「もう一度解く」（間違えた問題があれば「間違えた問題を解き直す」）で移る。
// 間違えた問題の行を押すと onReview（何番目か）
export function ResultView({
  name,
  result,
  missed,
  onTryAgain,
  onRetry,
  onReview,
}: {
  name: string;
  result: SessionResult;
  missed: MissedQuestion[];
  onTryAgain: () => void;
  onRetry: () => void;
  onReview: (index: number) => void;
}) {
  const counted = result.accuracy !== null;
  return (
    <div className="flex min-h-screen flex-col">
      <AppBar signOutAction={signOutAction} />
      <main className="mx-auto flex w-full max-w-page flex-1 flex-col gap-6 px-4 pt-6 pb-10">
        <PageHeader kicker="解き終わりました" title={name} />
        <section className="flex flex-col gap-2 border-b border-border pb-6">
          {counted ? (
            <p className="text-lg text-muted tabular-nums">
              <span className="text-display font-bold text-text">
                {result.correct}
              </span>
              {` / ${result.total}問 正解`}
            </p>
          ) : (
            <p className="text-display font-bold text-muted">—</p>
          )}
          <p className="text-sm text-muted">
            {counted
              ? `正答率 ${result.accuracy}%`
              : "数える問題がありませんでした（すべてに不備の印）"}
          </p>
          <p className="flex flex-wrap gap-4 text-xs text-muted">
            <Count label="不正解" count={result.incorrect} />
            <Count label="飛ばした" count={result.skipped} />
            <Count label="不備の印（数えない）" count={result.flagged} />
          </p>
        </section>
        {missed.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 id="missed-heading" className="text-xs font-bold text-muted">
              間違えた問題
            </h2>
            <ul
              aria-labelledby="missed-heading"
              className="divide-y divide-border overflow-hidden rounded-md border border-border"
            >
              {missed.map((m, i) => (
                <MissedRow
                  key={m.review.question.id}
                  text={m.review.question.text}
                  topic={m.topic}
                  onClick={() => onReview(i)}
                />
              ))}
            </ul>
          </section>
        )}
        {counted && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-muted">Topic ごと</h2>
            <ul className="divide-y divide-border rounded-md border border-border">
              {result.topics.map((topic) => (
                <TopicResultRow key={topic.name} topic={topic} />
              ))}
            </ul>
          </section>
        )}
      </main>
      <div className="sticky bottom-0 border-t border-border bg-bg">
        <div className="mx-auto flex max-w-page gap-2 px-4 py-3">
          <div className="shrink-0">
            <Link
              href="/"
              className={`block text-center ${buttonClass("outline", "lg")}`}
            >
              ホームへ戻る
            </Link>
          </div>
          <div className="flex-1">
            {missed.length > 0 ? (
              <Button size="lg" onClick={onRetry}>
                間違えた問題を解き直す
              </Button>
            ) : (
              <Button size="lg" onClick={onTryAgain}>
                もう一度解く
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 不正解・飛ばした・不備の印の数。ラベルは muted、数は text の色
function Count({ label, count }: { label: string; count: number }) {
  return (
    <span>
      {`${label} `}
      <span className="text-text tabular-nums">{count}</span>
    </span>
  );
}
