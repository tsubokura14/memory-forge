"use server";

import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { nextPath } from "@/server/auth/next-path";

export type SignInState = {
  result: "idle" | "error" | "notLinked";
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
