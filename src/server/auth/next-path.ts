// sign in のあとに移る先。アプリの中のパスだけを通し、よそのサイトへ移されないようにする。
// `//example.com` と `/\example.com` は、ブラウザがよそのサイトとして扱うので通さない
export function nextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) return "/";
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
