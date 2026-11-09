"use client";

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Choice, type ChoiceMark } from "@/components/choice";
import { Dialog } from "@/components/dialog";
import { RichText } from "@/components/rich-text";
import { SolveBar } from "@/components/solve-bar";
import { choiceLetter } from "@/server/import/validate";
import type { AnswerResult } from "@/server/solve/answer";
import type { Outcome } from "@/server/solve/result";
import type { SolveQuestion } from "@/server/solve/start";
import { answerAction, flagAction, skipAction } from "./actions";

// 保存できなかった操作。retry は同じ中身で送り直す
type Failed =
  { kind: "submit"; selected: string[] } | { kind: "skip" } | { kind: "flag" };

// 1問ずつ解く。最後の問題の results・skip・答える前の flag で onComplete（1問ずつの結果を渡す）、quit のダイアログの quit で onQuit
export function SolveView({
  questions,
  onComplete,
  onQuit,
}: {
  questions: SolveQuestion[];
  onComplete: (outcomes: Outcome[]) => void;
  onQuit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState({ correct: 0, wrong: 0 });
  // 保存できた答えだけを足す（保存できなかった操作は数えない）
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  // 答え合わせの結果。null の間は、まだ答えていない
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [view, setView] = useState<"question" | "explanation">("question");
  // 答えを送っている間は、下のボタンを押せない（二重に記録しないため）
  const [busy, setBusy] = useState(false);
  // 帯を出している間も、選び直し・submit・skip・flag はできる。送る操作のどれかが通るか、次の問題に進むと消す
  const [failed, setFailed] = useState<Failed | null>(null);
  const [quitting, setQuitting] = useState(false);
  // 答えたあとに、今の問題へ印を付けたか
  const [flagged, setFlagged] = useState(false);
  // 答える前に印を付けた問題の ID。次の操作（選ぶ・submit・skip・flag）で消す
  const [notice, setNotice] = useState<string | null>(null);

  const question = questions[index];
  const multiple = question.type === "multiple";
  const last = index === questions.length - 1;

  // skip と答える前の flag は、足したばかりの結果がまだ outcomes に入っていないので、渡して使う
  function advance(done = outcomes) {
    if (last) {
      onComplete(done);
      return;
    }
    setIndex(index + 1);
    setSelected([]);
    setResult(null);
    setView("question");
    setFailed(null);
    setFlagged(false);
  }

  function toggle(letter: string) {
    setNotice(null);
    if (!multiple) {
      setSelected([letter]);
      return;
    }
    setSelected(
      selected.includes(letter)
        ? selected.filter((l) => l !== letter)
        : [...selected, letter],
    );
  }

  // 保存できなかったときは、数を進めずに帯を出す
  async function submit(answer = selected) {
    setNotice(null);
    setBusy(true);
    try {
      const answered = await answerAction(question.id, answer);
      setSelected(answer);
      setFailed(null);
      setResult(answered);
      setOutcomes([
        ...outcomes,
        outcomeOf(question, answered.correct ? "correct" : "incorrect"),
      ]);
      setCounts((c) =>
        answered.correct
          ? { ...c, correct: c.correct + 1 }
          : { ...c, wrong: c.wrong + 1 },
      );
    } catch (error) {
      unstable_rethrow(error);
      setFailed({ kind: "submit", selected: answer });
    } finally {
      setBusy(false);
    }
  }

  async function skip() {
    setNotice(null);
    setBusy(true);
    try {
      await skipAction(question.id);
      setFailed(null);
      setCounts((c) => ({ ...c, wrong: c.wrong + 1 }));
      const done = [...outcomes, outcomeOf(question, "skipped")];
      setOutcomes(done);
      advance(done);
    } catch (error) {
      unstable_rethrow(error);
      setFailed({ kind: "skip" });
    } finally {
      setBusy(false);
    }
  }

  // 答える前は、答えていないので記録も上の数も増やさず、次の問題に進む（問題の誤りは、解いた人の間違いではないため）。
  // 答えたあとは、その問題の結果だけを flagged に置き換え、上の数と記録はそのままにする
  async function flag() {
    setNotice(null);
    setBusy(true);
    try {
      await flagAction(question.id);
      setFailed(null);
      const flaggedOutcome = outcomeOf(question, "flagged");
      if (result) {
        setOutcomes([...outcomes.slice(0, -1), flaggedOutcome]);
        setFlagged(true);
      } else {
        const done = [...outcomes, flaggedOutcome];
        setOutcomes(done);
        setNotice(question.questionId);
        advance(done);
      }
    } catch (error) {
      unstable_rethrow(error);
      setFailed({ kind: "flag" });
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    if (failed?.kind === "submit") submit(failed.selected);
    else if (failed?.kind === "flag") flag();
    else skip();
  }

  function markOf(letter: string): ChoiceMark | undefined {
    if (!result) return undefined;
    const isAnswer = result.answer.includes(letter);
    const isSelected = selected.includes(letter);
    if (isAnswer) return isSelected ? "hit" : "missed";
    return isSelected ? "wrong" : null;
  }

  const failedBanner = failed && (
    <Banner
      action={
        <Button variant="danger" disabled={busy} onClick={retry}>
          retry
        </Button>
      }
    >
      {failed.kind === "flag"
        ? "Couldn't flag this question."
        : "Couldn't save your answer."}
    </Banner>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SolveBar
        correct={counts.correct}
        wrong={counts.wrong}
        answered={outcomes.length}
        current={index + 1}
        total={questions.length}
        onQuit={() => setQuitting(true)}
      />
      <main className="mx-auto flex w-full max-w-page flex-1 flex-col gap-4 px-4 pt-5 pb-8">
        {notice && (
          <Banner tone="warning">
            <span className="flex items-center gap-1 font-mono">
              <span aria-hidden className="icon text-base leading-none">
                flag
              </span>
              <span>{`${notice} flagged — moved on without recording.`}</span>
            </span>
          </Banner>
        )}
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <span className="rounded-sm border border-border bg-surface px-1.5 py-0.5">
            {multiple ? "multi" : "single"}
          </span>
          <span>{question.topic}</span>
          <span>{question.questionId}</span>
          {/* flagged のあとは押しても何もしない（Solve では外せないため）。押せない見た目にはしない */}
          <Button
            variant={flagged ? "flagged" : "flag"}
            size="sm"
            className="ml-auto flex items-center gap-1"
            disabled={busy}
            onClick={flagged ? undefined : flag}
          >
            <span aria-hidden className="icon text-base leading-none">
              flag
            </span>
            {flagged ? "flagged" : "flag"}
          </Button>
        </div>
        {view === "explanation" && result ? (
          <>
            <section className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
              <h2 className="font-mono text-xs text-muted">explanation</h2>
              <div className="text-base">
                <RichText text={result.explanation} />
              </div>
            </section>
            {failedBanner}
          </>
        ) : (
          <>
            <div className="text-lg">
              <RichText text={question.text} lineNumbers />
            </div>
            {result && <ResultBanner result={result} />}
            <div className="flex items-center gap-3 font-mono text-xs text-muted">
              <span>{multiple ? "select all that apply" : "choose one"}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-2">
              {question.choices.map((text, i) => {
                const letter = choiceLetter(i);
                return (
                  <Choice
                    key={letter}
                    letter={letter}
                    text={text}
                    multiple={multiple}
                    selected={selected.includes(letter)}
                    mark={markOf(letter)}
                    disabled={result !== null || busy}
                    onClick={() => toggle(letter)}
                  />
                );
              })}
            </div>
            {failedBanner}
          </>
        )}
      </main>
      {/* fixed でなく sticky にして、問題が長いときも、最後の選択肢がバーの下に隠れないようにする */}
      <div className="sticky bottom-0 border-t border-border bg-surface">
        <div className="mx-auto flex max-w-page flex-col gap-2 px-4 py-3">
          {result ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    setView(view === "question" ? "explanation" : "question")
                  }
                >
                  {view === "question" ? "explanation" : "question"}
                </Button>
              </div>
              <div className="flex-1">
                {/* 印を送っている間に進むと、次の問題の結果を置き換えてしまう */}
                <Button size="lg" disabled={busy} onClick={() => advance()}>
                  <span className="flex items-center justify-center gap-1">
                    {last ? "results" : "next"}
                    <span aria-hidden className="icon text-base">
                      arrow_forward
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p
                className={`text-center font-mono text-xs text-muted ${selected.length > 0 ? "invisible" : ""}`}
              >
                select an option to proceed
              </p>
              <div className="flex gap-2">
                <div className="shrink-0">
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={busy}
                    onClick={skip}
                  >
                    skip
                  </Button>
                </div>
                <div className="flex-1">
                  <Button
                    size="lg"
                    disabled={selected.length === 0 || busy}
                    onClick={() => submit()}
                  >
                    submit
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Dialog
        open={quitting}
        title="Quit this session?"
        description="Answers so far are kept."
        onCancel={() => setQuitting(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setQuitting(false)}>
              continue
            </Button>
            <Button onClick={onQuit}>quit</Button>
          </>
        }
      />
    </div>
  );
}

function outcomeOf(
  question: SolveQuestion,
  outcome: Outcome["outcome"],
): Outcome {
  return {
    topic: question.topic,
    outcome,
    correctBefore: question.correctBefore,
  };
}

// 正解は success の「correct」、不正解は danger の「incorrect — answer: B」（複数選択は「A, B」）
function ResultBanner({ result }: { result: AnswerResult }) {
  return (
    <Banner tone={result.correct ? "success" : "danger"}>
      <span className="flex items-center gap-1 font-mono">
        <span aria-hidden className="icon text-base">
          {result.correct ? "check" : "close"}
        </span>
        <span>
          {result.correct
            ? "correct"
            : `incorrect — answer: ${result.answer.join(", ")}`}
        </span>
      </span>
    </Banner>
  );
}

// docs/ui.md の「読み込み中」。問題の上の行・問題文・コード・選択肢の形の枠を点滅させる
export function SolveSkeleton() {
  return (
    <main className="mx-auto max-w-page px-4 pt-6 pb-10">
      <div
        data-testid="solve-loading"
        className="flex animate-pulse flex-col gap-4"
      >
        <div className="h-4 w-40 rounded-sm bg-surface-raised" />
        <div className="h-6 w-2/3 rounded-sm bg-surface-raised" />
        <div className="h-48 rounded-md border border-border bg-surface-raised" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-12 rounded-md border border-border bg-surface-raised"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
