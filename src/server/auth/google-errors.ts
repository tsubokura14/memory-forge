// Google から戻ってきたとき、Better Auth が errorCallbackURL に付ける error のコードから、Settings に紐づけの失敗を出すかを決める
export function linkErrorFromGoogle(code: string | undefined): boolean {
  // Google の画面でキャンセルした。自分でやめたので、エラーにしない
  return !!code && code !== "access_denied";
}

// 同じく、Login に出す帯を決める
export function signInErrorFromGoogle(
  code: string | undefined,
): "notLinked" | "error" | null {
  if (!code) return null;
  // Google の画面でキャンセルした。自分でやめたので、エラーにしない
  if (code === "access_denied") return null;
  // signup_disabled：どのアカウントにも紐づいていない（disableSignUp）。
  // account_not_linked：自分のメールアドレスと同じだが、紐づけていない（disableImplicitLinking）
  if (code === "signup_disabled" || code === "account_not_linked") {
    return "notLinked";
  }
  return "error";
}
