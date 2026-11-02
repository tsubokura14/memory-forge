"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { RadioList } from "@/components/radio-list";
import { Segmented } from "@/components/segmented";
import { type Count, type Order, startNotice } from "@/server/solve/pick";
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

// Topic・順番・問題数を選ぶ。topic の null は All。start は T4 で Solve につなぐ
export function SetupForm({ setup }: { setup: Setup }) {
  const [topic, setTopic] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>("in-order");
  const [count, setCount] = useState<Count>(10);

  const chosen =
    topic === null
      ? setup.topics
      : setup.topics.filter((t) => t.name === topic);
  const stats = {
    total: chosen.reduce((sum, t) => sum + t.total, 0),
    answered: chosen.reduce((sum, t) => sum + t.answered, 0),
  };
  const start = startNotice(stats, order, count);
  // All のときは、Topic の名前の代わりに Subject の名前で案内する
  const scope = topic ?? setup.name;

  return (
    <div className="flex flex-col gap-5">
      <Field label="topic">
        <RadioList
          label="topic"
          options={[
            ...setup.topics.map((t) => ({ value: t.name, label: t.name })),
            { value: null, label: "All", strong: true },
          ]}
          value={topic}
          onChange={setTopic}
        />
      </Field>
      <Field label="order">
        <Segmented
          label="order"
          options={ORDERS}
          value={order}
          onChange={setOrder}
        />
      </Field>
      <Field label="questions">
        <Segmented
          label="questions"
          options={COUNTS}
          value={count}
          onChange={setCount}
        />
      </Field>
      <div className="flex flex-col gap-3">
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
        <Button size="lg" disabled={start.count === 0}>
          start · {start.count}
        </Button>
      </div>
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
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-xs text-muted">{label}</h2>
      {children}
    </section>
  );
}
