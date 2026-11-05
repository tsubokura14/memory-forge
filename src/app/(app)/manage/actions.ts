"use server";

import { cookies } from "next/headers";
import { requireSession } from "@/server/auth/session";
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
