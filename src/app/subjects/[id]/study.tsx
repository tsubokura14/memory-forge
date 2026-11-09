"use client";

import { unstable_rethrow, useRouter } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/(app)/actions";
import { AppBar } from "@/components/app-bar";
import { PageHeader } from "@/components/page-header";
import { SolveBar } from "@/components/solve-bar";
import { startNotice, topicStats } from "@/server/solve/pick";
import { type SessionResult, summarizeSession } from "@/server/solve/result";
import type { Setup } from "@/server/solve/setup";
import type { SolveQuestion } from "@/server/solve/start";
import { startSessionAction } from "./actions";
import { BACK, KICKER, Main } from "./main";
import { ResultView } from "./result-view";
import { type Choices, SetupForm } from "./setup-form";
import { SolveSkeleton, SolveView } from "./solve-view";

// Setup・Solve・Result を、ブラウザの中の状態だけで切り替える（docs/design.md の「解く画面の状態」）
type Phase =
  // failed は、start で問題を読めなかったあと
  | { kind: "setup"; failed: boolean }
  // expected は、start に添えた数（読み込み中の上のバーに出す）
  | { kind: "loading"; expected: number }
  | { kind: "solving"; questions: SolveQuestion[] }
  | { kind: "result"; result: SessionResult };

export function Study({
  subjectId,
  setup,
}: {
  subjectId: number;
  setup: Setup;
}) {
  const router = useRouter();
  const [choices, setChoices] = useState<Choices>({
    topic: null,
    order: "in-order",
    count: 10,
  });
  const [phase, setPhase] = useState<Phase>({ kind: "setup", failed: false });

  async function start() {
    const { topic, order, count } = choices;
    const expected = startNotice(topicStats(setup.topics, topic), order, count);
    setPhase({ kind: "loading", expected: expected.count });
    let questions: SolveQuestion[];
    try {
      questions = await startSessionAction(subjectId, topic, order, count);
    } catch (error) {
      unstable_rethrow(error);
      // サーバーにつながらないなど。理由は画面に出さない
      setPhase({ kind: "setup", failed: true });
      return;
    }
    // Setup を開いたあとに記録が変わり、出せる問題がなくなったときも、読めなかったときと同じにする
    if (questions.length === 0) {
      setPhase({ kind: "setup", failed: true });
      return;
    }
    setPhase({ kind: "solving", questions });
  }

  function backToSetup() {
    setPhase({ kind: "setup", failed: false });
    // 答えた分で、Setup の解いた問題の数（lowest accuracy の start の数）が変わるので、読み直す。選び方は残る
    router.refresh();
  }

  if (phase.kind === "setup") {
    return (
      <>
        <AppBar signOutAction={signOutAction} />
        <Main>
          <PageHeader back={BACK} kicker={KICKER} title={setup.name} />
          <SetupForm
            setup={setup}
            choices={choices}
            onChange={setChoices}
            onStart={start}
            failed={phase.failed}
          />
        </Main>
      </>
    );
  }
  if (phase.kind === "loading") {
    return (
      <>
        <SolveBar
          correct={0}
          wrong={0}
          answered={0}
          current={1}
          total={phase.expected}
        />
        <SolveSkeleton />
      </>
    );
  }
  if (phase.kind === "result") {
    return (
      <ResultView
        name={setup.name}
        result={phase.result}
        onTryAgain={backToSetup}
      />
    );
  }
  return (
    <SolveView
      questions={phase.questions}
      onComplete={(outcomes) =>
        setPhase({
          kind: "result",
          result: summarizeSession(
            outcomes,
            setup.topics.map((t) => t.name),
          ),
        })
      }
      onQuit={backToSetup}
    />
  );
}
