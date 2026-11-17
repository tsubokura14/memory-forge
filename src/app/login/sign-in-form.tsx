"use client";

import { unstable_rethrow } from "next/navigation";
import { useActionState } from "react";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { type SignInState, signInWithGoogleAction } from "./actions";

const MESSAGES: Record<Exclude<SignInState["result"], "idle">, string> = {
  error: "Couldn't sign in. Please try again.",
  notLinked: "This Google account isn't linked.",
};

export function SignInForm({
  next,
  initialResult,
}: {
  next: string | null;
  // Google から戻ってきたときのエラー（Login の URL の error から決める）
  initialResult: SignInState["result"];
}) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    async (previous: SignInState, formData: FormData) => {
      try {
        return await signInWithGoogleAction(previous, formData);
      } catch (error) {
        // Google への移動（redirect）も、ここに投げられてくるので、Next.js に返す
        unstable_rethrow(error);
        // サーバーにつながらないとき
        return { result: "error" };
      }
    },
    { result: initialResult },
  );

  return (
    <form action={formAction}>
      <fieldset disabled={pending} className="flex flex-col gap-4">
        {state.result !== "idle" && <Banner>{MESSAGES[state.result]}</Banner>}
        {next && <input type="hidden" name="next" value={next} />}
        <Button type="submit">
          {pending ? "signing in…" : "sign in with google"}
        </Button>
      </fieldset>
    </form>
  );
}
