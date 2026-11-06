"use server";

import { cookies } from "next/headers";
import { requireSession } from "@/server/auth/session";
import { exportSubject } from "@/server/manage/export";
import { parseSaved, type Saved } from "@/server/manage/selection";
import { MANAGE_COOKIE } from "./cookie";

// 選び方を cookie に書く。cookie を書くと、Next.js が Manage をサーバーで組み立て直して返す
// （docs/design.md の「Manage の選び方」）
export async function selectAction(saved: Saved): Promise<void> {
  await requireSession();
  const store = await cookies();
  // ブラウザから届いた値なので、cookie から読むときと同じ決まりで確かめる
  const valid = parseSaved(JSON.stringify(saved));
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
): Promise<{ fileName: string; content: string }> {
  await requireSession();
  const exported = await exportSubject(subjectId);
  if (!exported) throw new Error("No subject.");
  return exported;
}
