// サーバーで「今」を使うところは、これを呼ぶ。FIXED_NOW（ISO 8601 の日時）は画面を撮るときだけ置く（docs/design.md の「画面の画像を撮る・比べる仕組み」）
export function now(): Date {
  const fixed = process.env.FIXED_NOW;
  return fixed ? new Date(fixed) : new Date();
}
