"use server";

import { redirect, RedirectType } from "next/navigation";
import { nextPath } from "@/server/auth/next-path";
import { signIn } from "@/server/auth/sign-in";

export type SignInState = { result: "idle" | "incorrect" | "locked" | "error" };

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
