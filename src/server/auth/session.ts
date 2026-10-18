import { auth } from "./auth";

// ログインしているかを、cookie の token で DB まで確かめる。していなければ null
export function getSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

// セッションを DB から消し、cookie も消す
export async function endSession(headers: Headers) {
  await auth.api.signOut({ headers });
}
