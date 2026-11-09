"use client";

import { useState, useTransition } from "react";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Dropdown } from "@/components/dropdown";
import { Pagination } from "@/components/pagination";
import { QuestionRow } from "@/components/question-row";
import type { Manage, ManageQuestion } from "@/server/manage/list";
import { rangeText } from "@/server/manage/pages";
import type { Saved } from "@/server/manage/selection";
import {
  deleteQuestionAction,
  deleteSubjectAction,
  deleteTopicAction,
  exportAction,
  selectAction,
} from "./actions";
import { ManageHeader } from "./manage-header";

// Topic のプルダウンの、All topics の行の key（Topic の名前と重ならないように、名前には入らない空の文字にする）
const ALL_TOPICS = "";

// 確認のダイアログを開いている、消すもの
type Deleting =
  | { kind: "subject" }
  | { kind: "topic"; topic: string; count: number }
  | { kind: "question"; question: ManageQuestion };

// 上の export、絞り込みと問題の一覧、削除の確認のダイアログ。
// 選び方を変える・消すと、サーバーアクションが cookie を書き、サーバーが組み立て直した一覧が届く
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
  // 書き出せなかった Subject の名前。もう一度書き出せたときと、選び方を変えたときに消す
  const [exportFailed, setExportFailed] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  // 消している間（返事が来て、組み立て直した一覧が出るまで）は、cancel と delete を押せず、Esc でも閉じない
  const [deletePending, startDelete] = useTransition();
  // 「Couldn't delete.」の帯。開き直したときと、もう一度 delete を押したときに消す
  const [deleteFailed, setDeleteFailed] = useState(false);

  const subject = subjects.find((s) => s.id === selected.subjectId);
  const subjectName = subject?.name ?? "";

  function select(next: Saved) {
    setExportFailed(null);
    startTransition(async () => {
      try {
        await selectAction(next);
        setFailed(null);
      } catch {
        setFailed(next);
      }
    });
  }

  async function exportSubject() {
    const name = subjectName;
    try {
      const { fileName, content } = await exportAction(selected.subjectId);
      download(fileName, content);
      setExportFailed(null);
    } catch {
      setExportFailed(name);
    }
  }

  function openDelete(target: Deleting) {
    setDeleteFailed(false);
    setDeleting(target);
  }

  function closeDelete() {
    if (!deletePending) setDeleting(null);
  }

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    const current: Saved = {
      subjectId: selected.subjectId,
      topic: selected.topic,
      page: selected.page,
      flagged: selected.flagged,
    };
    setDeleteFailed(false);
    startDelete(async () => {
      try {
        if (target.kind === "subject") {
          await deleteSubjectAction(selected.subjectId);
        } else if (target.kind === "topic") {
          await deleteTopicAction(selected.subjectId, target.topic);
        } else {
          await deleteQuestionAction(target.question.id, current);
        }
        // 組み立て直した一覧と一緒に閉じる
        startDelete(() => setDeleting(null));
      } catch {
        setDeleteFailed(true);
      }
    });
  }

  const topicTotal = selected.topics.reduce((sum, t) => sum + t.count, 0);
  const [first, ...rest] = rangeText(selected.page, selected.total).split(
    " of ",
  );

  return (
    <>
      <ManageHeader>
        <Button variant="outline" onClick={exportSubject}>
          export {subjectName}
        </Button>
      </ManageHeader>
      <div className="flex flex-col gap-3">
        {/* スマホの幅では、Subject と Topic を縦に並べる */}
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-3 sm:flex-row">
          <Field label="subject">
            <Dropdown
              label="subject"
              className="min-w-0 flex-1"
              options={subjects.map((s) => ({
                key: String(s.id),
                label: s.name,
                count: s.count,
              }))}
              selected={String(selected.subjectId)}
              onSelect={(key) =>
                select({
                  subjectId: Number(key),
                  topic: null,
                  page: 1,
                  flagged: false,
                })
              }
            />
            <DeleteIcon
              label="delete subject"
              onClick={() => openDelete({ kind: "subject" })}
            />
          </Field>
          <Field label="topic">
            <Dropdown
              label="topic"
              className="min-w-0 flex-1"
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
                  flagged: selected.flagged,
                })
              }
            />
            {/* All topics のときは、Topic の delete を出さない */}
            {selected.topic !== null && (
              <DeleteIcon
                label="delete topic"
                onClick={() =>
                  openDelete({
                    kind: "topic",
                    topic: selected.topic!,
                    count: selected.total,
                  })
                }
              />
            )}
          </Field>
        </div>

        {exportFailed !== null && (
          <Banner>Couldn&apos;t export {exportFailed}.</Banner>
        )}

        {/* retry を押したあとも、返事が来るまでは読み込み中を出す */}
        {pending ? (
          <QuestionsSkeleton />
        ) : failed ? (
          <Banner
            action={
              <Button variant="danger" onClick={() => select(failed)}>
                retry
              </Button>
            }
          >
            Couldn&apos;t load questions.
          </Banner>
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
                    flagged: selected.flagged,
                  })
                }
              />
            </div>
            <ul
              aria-label="questions"
              className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-surface"
            >
              {selected.questions.map((q) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  onDelete={() => openDelete({ kind: "question", question: q })}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      <Dialog
        open={deleting !== null}
        title={deleteTitle(deleting, subjectName)}
        lead={
          deleting?.kind === "question" && (
            // 長いときは折り返して全部出す（どの問題を消すのか確かめられるように）
            <p className="wrap-break-word">
              {deleting.question.text.split("\n")[0]}
            </p>
          )
        }
        description={deleteDescription(
          deleting,
          selected.topics.length,
          subject?.count ?? 0,
        )}
        onCancel={closeDelete}
        actions={
          <>
            <Button
              variant="outline"
              disabled={deletePending}
              onClick={closeDelete}
            >
              cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deletePending}
              onClick={confirmDelete}
            >
              delete
            </Button>
          </>
        }
      >
        {deleteFailed && <Banner>Couldn&apos;t delete.</Banner>}
      </Dialog>
    </>
  );
}

function deleteTitle(deleting: Deleting | null, subjectName: string) {
  if (deleting?.kind === "question") return "Delete this question?";
  const name = deleting?.kind === "topic" ? deleting.topic : subjectName;
  return `Delete “${name}”?`;
}

function deleteDescription(
  deleting: Deleting | null,
  topicCount: number,
  questionCount: number,
) {
  const end = "This can't be undone.";
  if (deleting?.kind === "question") {
    return `Its records will be deleted too. ${end}`;
  }
  if (deleting?.kind === "topic") {
    return `${questionsText(deleting.count)} will be deleted. ${end}`;
  }
  return `${plural(topicCount, "topic")}, ${questionsText(questionCount)} will be deleted. ${end}`;
}

// 数が1のときは単数にする（1 topic、1 question and its records）
function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function questionsText(count: number) {
  return `${plural(count, "question")} and ${count === 1 ? "its" : "their"} records`;
}

// Subject・Topic のプルダウンのすぐ右に置く、delete の印だけのボタン
function DeleteIcon({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="deleteIcon"
      size="icon"
      aria-label={label}
      onClick={onClick}
    >
      <span aria-hidden className="icon text-lg leading-none">
        delete
      </span>
    </Button>
  );
}

// 書き出した中身を、ファイルとしてブラウザに保存させる
function download(fileName: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // 保存が始まる前に捨てると、ブラウザによっては保存が切れるので、次の処理の順番まで待つ
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// 見出しの下に、プルダウンと、そのすぐ右の delete を横に並べる
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:w-64">
      <span aria-hidden className="font-mono text-xs text-muted">
        {label}
      </span>
      <div className="flex gap-2">{children}</div>
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
