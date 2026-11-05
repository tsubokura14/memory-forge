"use client";

import { useState, useTransition } from "react";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Dropdown } from "@/components/dropdown";
import { Pagination } from "@/components/pagination";
import { QuestionRow } from "@/components/question-row";
import type { Manage } from "@/server/manage/list";
import { rangeText } from "@/server/manage/pages";
import type { Saved } from "@/server/manage/selection";
import { selectAction } from "./actions";

// Topic のプルダウンの、All topics の行の key（Topic の名前と重ならないように、名前には入らない空の文字にする）
const ALL_TOPICS = "";

// 絞り込みと問題の一覧。選び方を変えると、サーバーアクションが cookie を書き、サーバーが組み立て直した一覧が届く
export function ManageView({
  subjects,
  selected,
}: {
  subjects: Manage["subjects"];
  selected: NonNullable<Manage["selected"]>;
}) {
  const [pending, startTransition] = useTransition();
  // 読み込めなかった選び方。retry で、同じ選び方をもう一度送る
  const [failed, setFailed] = useState<Saved | null>(null);

  function select(next: Saved) {
    startTransition(async () => {
      try {
        await selectAction(next);
        setFailed(null);
      } catch {
        setFailed(next);
      }
    });
  }

  const topicTotal = selected.topics.reduce((sum, t) => sum + t.count, 0);
  const [first, ...rest] = rangeText(selected.page, selected.total).split(
    " of ",
  );

  return (
    <div className="flex flex-col gap-3">
      {/* スマホの幅では、Subject と Topic を縦に並べる */}
      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-3 sm:flex-row">
        <Field label="subject">
          <Dropdown
            label="subject"
            className="w-full sm:w-54"
            options={subjects.map((s) => ({
              key: String(s.id),
              label: s.name,
              count: s.count,
            }))}
            selected={String(selected.subjectId)}
            onSelect={(key) =>
              select({ subjectId: Number(key), topic: null, page: 1 })
            }
          />
        </Field>
        <Field label="topic">
          <Dropdown
            label="topic"
            className="w-full sm:w-64"
            options={[
              {
                key: ALL_TOPICS,
                label: "All topics",
                count: topicTotal,
                divider: true,
              },
              ...selected.topics.map((t) => ({
                key: t.name,
                label: t.name,
                count: t.count,
              })),
            ]}
            selected={selected.topic ?? ALL_TOPICS}
            onSelect={(key) =>
              select({
                subjectId: selected.subjectId,
                topic: key === ALL_TOPICS ? null : key,
                page: 1,
              })
            }
          />
        </Field>
      </div>

      {failed ? (
        <Banner
          action={
            <Button variant="danger" onClick={() => select(failed)}>
              retry
            </Button>
          }
        >
          Couldn&apos;t load questions.
        </Banner>
      ) : pending ? (
        <QuestionsSkeleton />
      ) : (
        <>
          <div className="flex min-h-7 items-center justify-between gap-3">
            <p className="font-mono text-xs">
              {first} <span className="text-muted">of</span> {rest.join("")}
            </p>
            <Pagination
              page={selected.page}
              last={selected.lastPage}
              onPage={(page) =>
                select({
                  subjectId: selected.subjectId,
                  topic: selected.topic,
                  page,
                })
              }
            />
          </div>
          <ul
            aria-label="questions"
            className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-surface"
          >
            {selected.questions.map((q) => (
              <QuestionRow key={q.id} question={q} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span aria-hidden className="font-mono text-xs text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}

// docs/ui.md の「読み込み中」。問題の行の形の枠を6つ点滅させる
export function QuestionsSkeleton() {
  return (
    <div
      data-testid="questions-loading"
      className="flex animate-pulse flex-col gap-2"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="h-14 rounded-md border border-border bg-surface-raised"
        />
      ))}
    </div>
  );
}
