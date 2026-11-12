"use client";

import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { MasteryAccuracy, MasteryBar } from "@/components/mastery";
import { RadioList } from "@/components/radio-list";
import { Segmented } from "@/components/segmented";
import {
  type Count,
  type Order,
  startNotice,
  topicStats,
} from "@/server/solve/pick";
import { mastery } from "@/server/mastery/mastery";
import type { Setup } from "@/server/solve/setup";

const ORDERS: { value: Order; label: string }[] = [
  { value: "in-order", label: "in order" },
  { value: "random", label: "random" },
  { value: "lowest-accuracy", label: "lowest accuracy" },
];

const COUNTS: { value: Count; label: string }[] = [
  { value: "all", label: "all" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
];

// 選び方。topic の null は All。Solve から戻ったときに残すため、study.tsx が持つ
export type Choices = { topic: string | null; order: Order; count: Count };

export function SetupForm({
  setup,
  choices,
  onChange,
  onStart,
  failed,
}: {
  setup: Setup;
  choices: Choices;
  onChange: (choices: Choices) => void;
  onStart: () => void;
  // 問題を読めなかったとき。retry は start と同じ
  failed: boolean;
}) {
  const { topic, order, count } = choices;
  const stats = topicStats(setup.topics, topic);
  const start = startNotice(stats, order, count);
  // All のときは、Topic の名前の代わりに Subject の名前で案内する
  const scope = topic ?? setup.name;

  return (
    <div className="flex flex-col gap-5">
      <Field label="topic">
        <RadioList
          label="topic"
          options={[
            ...setup.topics.map((t) => ({
              value: t.name,
              label: t.name,
              ...masteryParts(t),
            })),
            {
              value: null,
              label: "All",
              strong: true,
              ...masteryParts(topicStats(setup.topics, null)),
            },
          ]}
          value={topic}
          onChange={(value) => onChange({ ...choices, topic: value })}
        />
      </Field>
      <Field label="order">
        <Segmented
          label="order"
          options={ORDERS}
          value={order}
          onChange={(value) => onChange({ ...choices, order: value })}
        />
      </Field>
      <Field label="questions">
        <Segmented
          label="questions"
          options={COUNTS}
          value={count}
          onChange={(value) => onChange({ ...choices, count: value })}
        />
      </Field>
      <div className="flex flex-col gap-3">
        {stats.flagged > 0 && start.count > 0 && (
          <p className="flex items-center gap-1 font-mono text-xs text-muted">
            <span className="flex items-center gap-0.5 text-warning">
              <span aria-hidden className="icon text-sm leading-none">
                flag
              </span>
              {stats.flagged}
            </span>{" "}
            flagged excluded
          </p>
        )}
        {start.notice === "few" && (
          <p className="font-mono text-xs text-muted">
            {scope} has only {start.count} questions to ask.
          </p>
        )}
        {start.notice === "unanswered" && (
          <p className="font-mono text-xs text-warning">
            No questions to ask — none in {scope} have been answered yet.
          </p>
        )}
        {start.notice === "flagged" && (
          <p className="font-mono text-xs text-warning">
            No questions to ask — all {stats.flagged} in {scope} are flagged.
          </p>
        )}
        {failed && (
          <Banner
            action={
              <Button variant="danger" onClick={onStart}>
                retry
              </Button>
            }
          >
            Couldn&apos;t load questions.
          </Banner>
        )}
        <Button size="lg" disabled={start.count === 0} onClick={onStart}>
          start · {start.count}
        </Button>
      </div>
    </div>
  );
}

// 行の名前の下の線と数（印の数つき）と、右の %
function masteryParts(stats: {
  total: number;
  answered: number;
  correct: number;
  flagged: number;
}) {
  const m = mastery(stats);
  return {
    description: <MasteryBar mastery={m} flagged={stats.flagged} />,
    aside: <MasteryAccuracy accuracy={m.accuracy} />,
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-xs text-muted">{label}</h2>
      {children}
    </section>
  );
}
