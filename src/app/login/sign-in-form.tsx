"use client";

import { unstable_rethrow } from "next/navigation";
import { useActionState, useState } from "react";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { TextField } from "@/components/text-field";
import { type SignInState, signInAction } from "./actions";

const MESSAGES: Record<Exclude<SignInState["result"], "idle">, string> = {
  incorrect: "Incorrect email or password.",
  locked: "Too many attempts. Try again in 15 minutes.",
  error: "Couldn't sign in. Please try again.",
};

export function SignInForm({ next }: { next: string | null }) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    async (previous: SignInState, formData: FormData) => {
      try {
        return await signInAction(previous, formData);
      } catch (error) {
        // 入れたあとの移動（redirect）も、ここに投げられてくるので、Next.js に返す
        unstable_rethrow(error);
        // サーバーにつながらないとき
        return { result: "error" };
      }
    },
    { result: "idle" },
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
      </fieldset>
    </form>
  );
}
