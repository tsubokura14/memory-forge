"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import {
  listGoogleAccounts,
  splitGoogleAccounts,
} from "@/server/auth/google-accounts";
import { getSession, requireSession } from "@/server/auth/session";

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

// accountId は Better Auth の account の行の id
export async function unlinkGoogleAction(
  accountId: string,
): Promise<GoogleActionState> {
  await requireSession();
  try {
    // Better Auth の unlinkAccount は、自分の行ならパスワードの行（credential）や自分の Google アカウントの行でも外すので、
    // Settings で足した Google の行だけを通す（画面に unlink がなくても、アクションは直接呼べるため）
    const { session } = await getSession(await headers());
    const added = session
      ? splitGoogleAccounts(
          session.user.email,
          await listGoogleAccounts(session.user.id),
        ).added
      : [];
    if (!added.some((account) => account.id === accountId)) {
      return { result: "error" };
    }
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
