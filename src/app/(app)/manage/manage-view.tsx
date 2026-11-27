"use client";

import { Icon } from "@/components/icons";
import { useState, useTransition } from "react";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Dropdown } from "@/components/dropdown";
import { EmptyState } from "@/components/empty-state";
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
  unflagAction,
} from "./actions";
import { ManageHeader } from "./manage-header";

// Topic のプルダウンの、すべての Topic の行の key（Topic の名前と重ならないように、名前には入らない空の文字にする）
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
  // 読み込めなかった選び方。「もう一度読み込む」で、同じ選び方をもう一度送る
  const [failed, setFailed] = useState<Saved | null>(null);
  // 書き出せなかった Subject の名前。もう一度書き出せたときと、選び方を変えたときに消す
  const [exportFailed, setExportFailed] = useState<string | null>(null);
  // 印を外せなかった問題の ID。もう一度外せたときと、選び方を変えたときに消す
  const [unflagFailed, setUnflagFailed] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  // 消している間（返事が来て、組み立て直した一覧が出るまで）は、やめると削除するを押せず、Esc でも閉じない
  const [deletePending, startDelete] = useTransition();
  // 「削除できませんでした。」の帯。開き直したときと、もう一度削除するを押したときに消す
  const [deleteFailed, setDeleteFailed] = useState(false);

  const subject = subjects.find((s) => s.id === selected.subjectId);
  const subjectName = subject?.name ?? "";
  const current: Saved = {
    subjectId: selected.subjectId,
    topic: selected.topic,
    page: selected.page,
    flagged: selected.flagged,
  };

  function select(next: Saved) {
    setExportFailed(null);
    setUnflagFailed(null);
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
      const { fileName, content } = await exportAction(
        selected.subjectId,
        selected.flagged,
      );
      download(fileName, content);
      setExportFailed(null);
    } catch {
      setExportFailed(name);
    }
  }

  async function unflag(question: ManageQuestion) {
    try {
      await unflagAction(question.id, current);
      setUnflagFailed(null);
    } catch {
      setUnflagFailed(question.questionId);
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
    setDeleteFailed(false);
    startDelete(async () => {
      try {
        if (target.kind === "subject") {
          await deleteSubjectAction(selected.subjectId);
        } else if (target.kind === "topic") {
          await deleteTopicAction(
            selected.subjectId,
            target.topic,
            selected.flagged,
          );
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
  const flaggedTotal = subject?.flagged ?? 0;

  return (
    <>
      <ManageHeader>
        {/* flagged の一覧で、Subject に印の付いた問題がないときは、書き出すものがないので出さない */}
        {!(selected.flagged && flaggedTotal === 0) && (
          <Button variant="outline" onClick={exportSubject}>
            {selected.flagged
              ? `${subjectName} の不備の印を書き出す`
              : `${subjectName} を書き出す`}
          </Button>
        )}
      </ManageHeader>
      <div className="flex flex-col gap-3">
        {/* スマホの幅では、Subject と Topic を縦に並べる */}
        <div className="flex flex-col gap-3 rounded-md border border-border bg-bg p-3 sm:flex-row">
          <Field label="科目">
            <Dropdown
              label="科目"
              className="min-w-0 flex-1"
              options={subjects.map((s) => ({
                key: String(s.id),
                label: s.name,
                count: s.count,
                flagged: s.flagged,
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
              label="科目を削除"
              onClick={() => openDelete({ kind: "subject" })}
            />
          </Field>
          <Field label="Topic">
            <Dropdown
              label="Topic"
              className="min-w-0 flex-1"
              options={[
                {
                  key: ALL_TOPICS,
                  label: "すべての Topic",
                  count: topicTotal,
                  flagged: flaggedTotal,
                  divider: true,
                },
                ...selected.topics.map((t) => ({
                  key: t.name,
                  label: t.name,
                  count: t.count,
                  flagged: t.flagged,
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
            {/* すべての Topic のときは、Topic の削除を出さない */}
            {selected.topic !== null && (
              <DeleteIcon
                label="Topic を削除"
                onClick={() =>
                  openDelete({
                    kind: "topic",
                    topic: selected.topic!,
                    // flagged の一覧では selected.total が印の数になるので、Topic の全部の問題の数を読む
                    count:
                      selected.topics.find((t) => t.name === selected.topic)
                        ?.count ?? 0,
                  })
                }
              />
            )}
          </Field>
          {/* 見出しのあるプルダウンと下の端をそろえる。スマホの幅では Topic の下に左寄せ */}
          <Button
            variant={selected.flagged ? "filterActive" : "filter"}
            size="filter"
            className="self-start sm:self-end"
            aria-pressed={selected.flagged}
            onClick={() =>
              select({
                subjectId: selected.subjectId,
                topic: selected.topic,
                page: 1,
                flagged: !selected.flagged,
              })
            }
          >
            <Icon name="flag" className="text-base leading-none" />
            不備の印
          </Button>
        </div>

        {exportFailed !== null && (
          <Banner>{exportFailed} を書き出せませんでした。</Banner>
        )}
        {unflagFailed !== null && (
          <Banner>{unflagFailed} の印を外せませんでした。</Banner>
        )}

        {/* もう一度読み込むを押したあとも、返事が来るまでは読み込み中を出す */}
        {pending ? (
          <QuestionsSkeleton />
        ) : failed ? (
          <Banner
            action={
              <Button variant="danger" onClick={() => select(failed)}>
                もう一度読み込む
              </Button>
            }
          >
            問題を読み込めませんでした。
          </Banner>
        ) : selected.total === 0 ? (
          // 問題が0問の Subject はないので、0件になるのは flagged の一覧だけ
          <EmptyState
            title={`${selected.topic ?? subjectName} に不備の印の付いた問題はありません。`}
          />
        ) : (
          <>
            <div className="flex min-h-7 items-center justify-between gap-3">
              <p className="text-xs">
                {rangeText(selected.page, selected.total)}
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
              aria-label="問題"
              className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-bg"
            >
              {selected.questions.map((q) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  onDelete={() => openDelete({ kind: "question", question: q })}
                  onUnflag={() => unflag(q)}
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
              やめる
            </Button>
            <Button
              variant="destructive"
              disabled={deletePending}
              onClick={confirmDelete}
            >
              削除する
            </Button>
          </>
        }
      >
        {deleteFailed && <Banner>削除できませんでした。</Banner>}
      </Dialog>
    </>
  );
}

function deleteTitle(deleting: Deleting | null, subjectName: string) {
  if (deleting?.kind === "question") return "この問題を削除しますか？";
  const name = deleting?.kind === "topic" ? deleting.topic : subjectName;
  return `「${name}」を削除しますか？`;
}

function deleteDescription(
  deleting: Deleting | null,
  topicCount: number,
  questionCount: number,
) {
  const end = "元に戻せません。";
  if (deleting?.kind === "question") {
    return `この問題の記録も削除します。${end}`;
  }
  if (deleting?.kind === "topic") {
    return `${deleting.count}問と、その記録を削除します。${end}`;
  }
  return `${topicCount} の Topic と ${questionCount} 問、その記録を削除します。${end}`;
}

// Subject・Topic のプルダウンのすぐ右に置く、削除の印だけのボタン
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
      <Icon name="trash-2" className="text-lg leading-none" />
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

// 見出しの下に、プルダウンと、そのすぐ右の削除を横に並べる
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:w-64">
      <span aria-hidden className="text-xs text-muted">
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
          className="h-14 rounded-md border border-border bg-surface"
        />
      ))}
    </div>
  );
}
