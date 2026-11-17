import { and, asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { account } from "@/server/db/schema";

export type GoogleAccount = { id: string; email: string };

// その人に紐づけた Google アカウントを、紐づけた順に返す。id は Better Auth の account の行の id（unlink に渡す）。
// メールアドレスは表に列がないので、Better Auth が紐づけ・ログインのたびに保存し直す ID トークンの中身から取り出す。
// 前提（崩れたら見直す）：Better Auth が Google の行に id_token を保存し続ける。版を上げて変わったら直す
export async function listGoogleAccounts(
  userId: string,
): Promise<GoogleAccount[]> {
  const rows = await db
    .select({ id: account.id, idToken: account.idToken })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
    .orderBy(asc(account.createdAt), asc(account.id));
  return rows.map((row) => ({ id: row.id, email: emailFrom(row.idToken) }));
}

// ID トークン（ヘッダー.中身.署名）の中身の email。署名は確かめない（Google からサーバーが直接受け取ったものを、自分の表から読むだけのため）
function emailFrom(idToken: string | null): string {
  const payload = idToken?.split(".")[1];
  if (!payload) return "";
  try {
    const { email } = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { email?: unknown };
    return typeof email === "string" ? email : "";
  } catch {
    return "";
  }
}

// Settings の google の行に並べる形に分ける。owner は自分の Google アカウント（user.email。docs/design.md の「データ」の「ログイン」）で、
// Google の行がまだなくても（一度も Google で入っていなくても）返す。added は Settings で足したもので、unlink で外せるのはこれだけ
export function splitGoogleAccounts(
  ownerEmail: string,
  accounts: GoogleAccount[],
): { owner: string; added: GoogleAccount[] } {
  const owner = ownerEmail.toLowerCase();
  return {
    owner: ownerEmail,
    added: accounts.filter((account) => account.email.toLowerCase() !== owner),
  };
}
