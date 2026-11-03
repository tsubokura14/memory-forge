"use client";

import Link from "next/link";
import { signOutAction } from "@/app/(app)/actions";
import { AccuracyRing } from "@/components/accuracy-ring";
import { AppBar } from "@/components/app-bar";
import { Button, buttonClass } from "@/components/button";
import { CountBox } from "@/components/count-box";
import { PageHeader } from "@/components/page-header";
import { TopicResultRow } from "@/components/topic-result-row";
import type { SessionResult } from "@/server/solve/result";

// 解き終わりの結果。戻るリンクは置かず、下の try again と home で移る
export function ResultView({
  name,
  result,
  onTryAgain,
}: {
  name: string;
  result: SessionResult;
  onTryAgain: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppBar signOutAction={signOutAction} />
      <main className="mx-auto flex w-full max-w-page flex-1 flex-col gap-6 px-4 pt-6 pb-10">
        <PageHeader crumbs={["session complete"]} title={name} />
        <div className="flex flex-col gap-2">
          <section className="flex items-center justify-center gap-8 rounded-md border border-border bg-surface px-4 py-6">
            <AccuracyRing accuracy={result.accuracy} />
            <div className="flex flex-col gap-2">
              <p className="text-display">
                <span className="text-success">{result.correct}</span>
                <span className="text-muted">/</span>
                {result.total}
              </p>
              <p className="font-mono text-xs text-muted">questions correct</p>
            </div>
          </section>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <CountBox count={result.correct} label="correct" tone="success" />
            <CountBox
              count={result.incorrect}
              label="incorrect"
              tone="danger"
            />
            <CountBox count={result.skipped} label="skipped" tone="danger" />
            <CountBox
              count={result.flagged}
              label="flagged · not counted"
              tone="warning"
            />
          </div>
        </div>
        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-xs text-muted">by topic</h2>
          <ul className="divide-y divide-border rounded-md border border-border bg-surface">
            {result.topics.map((topic) => (
              <TopicResultRow key={topic.name} topic={topic} />
            ))}
          </ul>
        </section>
      </main>
      <div className="sticky bottom-0 border-t border-border bg-surface">
        <div className="mx-auto flex max-w-page gap-2 px-4 py-3">
          <div className="flex-1">
            <Button variant="outline" size="lg" onClick={onTryAgain}>
              try again
            </Button>
          </div>
          <div className="flex-1">
            <Link
              href="/"
              className={`block text-center ${buttonClass("primary", "lg")}`}
            >
              home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
