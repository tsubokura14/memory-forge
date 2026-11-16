"use client";

import { unstable_rethrow } from "next/navigation";
import { useActionState, useState } from "react";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { TextField } from "@/components/text-field";
import {
  type SignInState,
  signInAction,
  signInWithGoogleAction,
} from "./actions";

const MESSAGES: Record<Exclude<SignInState["result"], "idle">, string> = {
  incorrect: "Incorrect email or password.",
  locked: "Too many attempts. Try again in 15 minutes.",
  error: "Couldn't sign in. Please try again.",
  notLinked:
    "This Google account isn't linked. Sign in with your email, then link it in settings.",
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
        // どちらのボタンも同じフォームから送り、同じ pending で全部を押せなくする。押したボタンの intent で分ける
        return formData.get("intent") === "google"
          ? await signInWithGoogleAction(previous, formData)
          : await signInAction(previous, formData);
      } catch (error) {
        // 入れたあとの移動（redirect）も、ここに投げられてくるので、Next.js に返す
        unstable_rethrow(error);
        // サーバーにつながらないとき
        return { result: "error" };
      }
    },
    { result: initialResult },
  );
  // React は、フォームの action が終わると入力を空にする。入れた値を残すため、入力は state で持つ
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={formAction}>
      <fieldset disabled={pending} className="flex flex-col gap-4">
        {state.result !== "idle" && <Banner>{MESSAGES[state.result]}</Banner>}
        <TextField
          label="email"
          name="email"
          // type="email" にすると、空のときのほかに形の誤りでもブラウザが止める。仕様は空のときだけなので、text にする
          type="text"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={state.result === "incorrect"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {next && <input type="hidden" name="next" value={next} />}
        <Button type="submit" className="mt-1">
          {pending ? "signing in…" : "sign in"}
        </Button>
        <div className="flex items-center gap-3 font-mono text-xs text-muted">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        {/* email と password が空でも Google には移れるよう、ブラウザの入力チェックを通さない */}
        <Button
          type="submit"
          name="intent"
          value="google"
          variant="outline"
          formNoValidate
        >
          sign in with google
        </Button>
      </fieldset>
    </form>
  );
}
