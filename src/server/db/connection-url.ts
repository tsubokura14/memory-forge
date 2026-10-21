// docs/design.md の「データベースのつながり方」。
// URL にどの sslmode があっても置き換え、なければ足す。ほかの値・ユーザー名・パスワードは変えない。
// 空やないときは、そのまま返す（つなぐときに、今までどおり失敗させる）
export function withVerifyFull<T extends string | undefined>(url: T): T {
  if (!url) return url;
  const parsed = new URL(url);
  parsed.searchParams.set("sslmode", "verify-full");
  return parsed.toString() as T;
}
