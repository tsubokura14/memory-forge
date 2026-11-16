"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireSession } from "@/server/auth/session";

export type GoogleActionState = { result: "idle" | "error" };

// Google の画面に移る。戻ってくる先は Settings（失敗なら Better Auth が ?error= を付ける）
export async function linkGoogleAction(): Promise<GoogleActionState> {
  await requireSession();
  let url;
  try {
    ({ url } = await auth.api.linkSocialAccount({
      headers: await headers(),
      body: {
        provider: "google",
        callbackURL: "/settings",
        errorCallbackURL: "/settings",
        disableRedirect: true,
      },
    }));
  } catch (error) {
    console.error(error);
    return { result: "error" };
  }
  redirect(url);
}

// accountId は Better Auth の account の行の id。自分の行でなければ Better Auth が断る
export async function unlinkGoogleAction(
  accountId: string,
): Promise<GoogleActionState> {
  await requireSession();
  try {
    await auth.api.unlinkAccount({
      headers: await headers(),
      body: { accountId },
    });
  } catch (error) {
    console.error(error);
    return { result: "error" };
  }
  revalidatePath("/settings");
  return { result: "idle" };
}
