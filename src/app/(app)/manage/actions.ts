"use server";

import { cookies } from "next/headers";
import { requireSession } from "@/server/auth/session";
import {
  type DeleteResult,
  deleteQuestion,
  deleteSubject,
  deleteTopic,
} from "@/server/manage/delete";
import { exportSubject } from "@/server/manage/export";
import {
  nextSubjectAfterDelete,
  parseSaved,
  type Saved,
} from "@/server/manage/selection";
import { unflagQuestion } from "@/server/solve/flag";
import { MANAGE_COOKIE } from "./cookie";

// 選び方を cookie に書く。cookie を書くと、Next.js が Manage をサーバーで組み立て直して返す
// （docs/design.md の「Manage の選び方」）
export async function selectAction(saved: Saved): Promise<void> {
  await requireSession();
  await saveSelection(saved);
}

async function saveSelection(saved: Saved | null) {
  const store = await cookies();
  // ブラウザから届いた値なので、cookie から読むときと同じ決まりで確かめる
  const valid = saved && parseSaved(JSON.stringify(saved));
  if (!valid) {
    store.delete(MANAGE_COOKIE);
    return;
  }
  store.set(MANAGE_COOKIE, JSON.stringify(valid), {
    httpOnly: true,
    sameSite: "lax",
  });
}

// 書き出す JSON の文字とファイルの名前を返し、ブラウザが保存させる。失敗をブラウザで受け取り、帯を出せるように、
// ダウンロード用の URL ではなくアクションにしている。
// 前提（崩れたら見直す）：書き出す中身が、Vercel の関数の返事の上限（4.5MB）より小さい。Import の上限は1つのファイルで 4MB なので、
// 取り込み直せる大きさの Subject は収まる。超えると書き出せず、帯が出る
export async function exportAction(
  subjectId: number,
  flaggedOnly: boolean,
): Promise<{ fileName: string; content: string }> {
  await requireSession();
  const exported = await exportSubject(subjectId, flaggedOnly);
  if (!exported) throw new Error("No subject.");
  return exported;
}

// 消したあとは、どれも消したあとに出す選び方を cookie に書く（docs/design.md の「Manage の選び方」）。
// Subject ごと消えたら、次の Subject（最後なら前）の All topics の1ページ目。Subject が1つもなくなったら cookie を消し、0件の表示になる
function afterDelete(
  result: DeleteResult,
  subjectId: number,
  kept: Saved,
): Saved | null {
  if (!result.subjectDeleted) return kept;
  const next = nextSubjectAfterDelete(result.remaining, subjectId);
  return next === null
    ? null
    : { subjectId: next, topic: null, page: 1, flagged: false };
}

export async function deleteSubjectAction(subjectId: number): Promise<void> {
  await requireSession();
  const result = await deleteSubject(subjectId);
  await saveSelection(
    afterDelete(result, subjectId, {
      subjectId,
      topic: null,
      page: 1,
      flagged: false,
    }),
  );
}

// Topic を消したら、All topics の1ページ目。flagged の一覧を見ていたら、flagged のまま
export async function deleteTopicAction(
  subjectId: number,
  topic: string,
  flagged: boolean,
): Promise<void> {
  await requireSession();
  const result = await deleteTopic(subjectId, topic);
  await saveSelection(
    afterDelete(result, subjectId, {
      subjectId,
      topic: null,
      page: 1,
      flagged,
    }),
  );
}

// 1問を消したら、今の選び方のまま。今のページが空になったら前のページ、Topic がなくなったら All topics の1ページ目になる
// （画面を組み立てるときの resolveSelection）
export async function deleteQuestionAction(
  id: number,
  current: Saved,
): Promise<void> {
  await requireSession();
  const result = await deleteQuestion(id);
  await saveSelection(afterDelete(result, current.subjectId, current));
}

// 印を外したら、今の選び方を書き直して、一覧を組み立て直す。flagged の一覧で今のページが空になったら前のページになる
// （画面を組み立てるときの resolveSelection）
export async function unflagAction(id: number, current: Saved): Promise<void> {
  await requireSession();
  await unflagQuestion(id);
  await saveSelection(current);
}
