"use server";

import { redirect, RedirectType } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { nextPath } from "@/server/auth/next-path";
import { signIn } from "@/server/auth/sign-in";

export type SignInState = {
  result: "idle" | "incorrect" | "locked" | "error" | "notLinked";
};

// Google の画面に移る。戻ってくる先は、成功なら移る先、失敗なら Login（Better Auth が ?error= を付ける）
export async function signInWithGoogleAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const next = formData.get("next")?.toString();
  const login = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  let url;
  try {
    ({ url } = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL: nextPath(next),
        errorCallbackURL: login,
        disableRedirect: true,
      },
    }));
  } catch (error) {
    console.error(error);
    return { result: "error" };
  }
  if (!url) return { result: "error" };
  redirect(url);
}

export async function signInAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  let result;
  try {
    result = await signIn({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
  } catch (error) {
    // DB につながらないなど。理由は画面に出さず、サーバーのログに残す
    console.error(error);
    return { result: "error" };
  }
  if (result !== "ok") return { result };

  // ブラウザの戻るで Login に戻らないよう、履歴を置き換える
  redirect(nextPath(formData.get("next")?.toString()), RedirectType.replace);
}
