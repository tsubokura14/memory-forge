"use client";

import { Icon } from "@/components/icons";
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
  { value: "in-order", label: "順番どおり" },
  { value: "random", label: "ばらばら" },
  { value: "lowest-accuracy", label: "苦手な順" },
];

const COUNTS: { value: Count; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: 5, label: "5問" },
  { value: 10, label: "10問" },
  { value: 20, label: "20問" },
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
  // 問題を読めなかったとき。もう一度読み込むは解きはじめると同じ
  failed: boolean;
}) {
  const { topic, order, count } = choices;
  const stats = topicStats(setup.topics, topic);
  const start = startNotice(stats, order, count);
  // All のときは、Topic の名前の代わりに Subject の名前で案内する
  const scope = topic ?? setup.name;

  return (
    <div className="flex flex-col gap-5">
      <Field label="Topic">
        <RadioList
          label="Topic"
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
      <Field label="順番">
        <Segmented
          label="順番"
          options={ORDERS}
          value={order}
          onChange={(value) => onChange({ ...choices, order: value })}
        />
      </Field>
      <Field label="問題数">
        <Segmented
          label="問題数"
          options={COUNTS}
          value={count}
          onChange={(value) => onChange({ ...choices, count: value })}
        />
      </Field>
      <div className="flex flex-col gap-3">
        {stats.flagged > 0 && start.count > 0 && (
          <p className="flex items-center gap-1 text-xs text-muted">
            <span className="flex items-center gap-0.5 text-warning">
              <Icon name="flag" className="text-sm leading-none" />
              {stats.flagged}
            </span>{" "}
            問は不備の印があるので出しません
          </p>
        )}
        {start.notice === "few" && (
          <p className="text-xs text-muted">
            {scope} で出せるのは {start.count} 問だけです。
          </p>
        )}
        {start.notice === "unanswered" && (
          <p className="text-xs text-warning">
            {scope} にはまだ解いた問題がないので、苦手な順では出せません。
          </p>
        )}
        {start.notice === "flagged" && (
          <p className="text-xs text-warning">
            {scope} の {stats.flagged}{" "}
            問すべてに不備の印があるので、出せる問題がありません。
          </p>
        )}
        {failed && (
          <Banner
            action={
              <Button variant="danger" onClick={onStart}>
                もう一度読み込む
              </Button>
            }
          >
            問題を読み込めませんでした。
          </Banner>
        )}
        <Button size="lg" disabled={start.count === 0} onClick={onStart}>
          {start.count > 0 ? `${start.count}問を解きはじめる` : "解きはじめる"}
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
      <h2 className="text-xs font-bold text-muted">{label}</h2>
      {children}
    </section>
  );
}
