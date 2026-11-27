import { Suspense } from "react";
import { Card } from "@/components/card";
import { Logo } from "@/components/logo";
import { signInErrorFromGoogle } from "@/server/auth/google-errors";
import { SignInForm } from "./sign-in-form";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo />
      <div className="w-full max-w-sm">
        <Card>
          <Suspense fallback={<SignInFormSkeleton />}>
            <SignInFormWithNext searchParams={searchParams} />
          </Suspense>
        </Card>
      </div>
    </main>
  );
}

async function SignInFormWithNext({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  const { next, error } = await searchParams;
  return (
    <SignInForm
      next={typeof next === "string" ? next : null}
      initialResult={
        signInErrorFromGoogle(typeof error === "string" ? error : undefined) ??
        "idle"
      }
    />
  );
}

// docs/ui.md の「読み込み中」。フォームと同じ形の枠を点滅させる
function SignInFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-9 rounded-md bg-surface" />
    </div>
  );
}
