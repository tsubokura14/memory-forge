"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Choice } from "@/components/choice";
import { Icon } from "@/components/icons";
import { RichText } from "@/components/rich-text";
import { choiceLetter } from "@/server/import/validate";
import type { MissedQuestion } from "@/server/solve/result";
import { markOf, ResultBanner } from "./solve-view";

// 間違えた問題の見直し。その回で答えたときの、答えたあとの Solve の見た目で出す。記録は送らない。
// 進み具合・不備の印・次の問題へは出さない（解いている回と見分け、戻り先を「結果に戻る」だけにするため）
export function ReviewView({
  missed,
  onBack,
}: {
  missed: MissedQuestion;
  onBack: () => void;
}) {
  const [view, setView] = useState<"question" | "explanation">("question");
  const { question, selected, answer, explanation } = missed.review;
  const multiple = question.type === "multiple";
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-bg">
        <div className="mx-auto flex max-w-page items-center px-4 py-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted"
          >
            <Icon name="arrow-left" className="text-base" />
            結果に戻る
          </button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-page flex-1 flex-col gap-4 px-4 pt-5 pb-8">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="rounded-sm bg-surface-raised px-1.5 py-0.5">
            {multiple ? "すべて選ぶ" : "1つ選ぶ"}
          </span>
          <span>{question.topic}</span>
          <span>{question.questionId}</span>
        </div>
        {view === "explanation" ? (
          <section className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
            <h2 className="text-xs text-muted">解説</h2>
            <div className="font-body text-base leading-loose">
              <RichText text={explanation} />
            </div>
          </section>
        ) : (
          <>
            <div className="font-body text-lg">
              <RichText text={question.text} lineNumbers />
            </div>
            <ResultBanner outcome={missed.outcome} answer={answer} />
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>
                {multiple
                  ? "当てはまるものをすべて選んでください"
                  : "1つ選んでください"}
              </span>
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
                    mark={markOf(letter, answer, selected)}
                    disabled
                    onClick={() => {}}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
      <div className="sticky bottom-0 border-t border-border bg-bg">
        <div className="mx-auto max-w-page px-4 py-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              setView(view === "question" ? "explanation" : "question")
            }
          >
            {view === "question" ? "解説を見る" : "問題に戻る"}
          </Button>
        </div>
      </div>
    </div>
  );
}
