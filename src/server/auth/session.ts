import { auth } from "./auth";

// ログインしているかを、cookie の token で DB まで確かめる。していなければ session は null。
// 期限を延ばしたときは、ブラウザに返す cookie が headers に入る
export async function getSession(headers: Headers) {
  const result = await auth.api.getSession({ headers, returnHeaders: true });
  return { session: result.response, headers: result.headers };
}

// セッションを DB から消し、cookie も消す
export async function endSession(headers: Headers) {
  await auth.api.signOut({ headers });
}
