import { Suspense } from "react";
import { Card } from "@/components/card";
import { Logo } from "@/components/logo";
import { SignInForm } from "./sign-in-form";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo />
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <Card>
          <Suspense fallback={<SignInFormSkeleton />}>
            <SignInFormWithNext searchParams={searchParams} />
          </Suspense>
        </Card>
        {/* パスワードの再設定（#4）ができるまでは、押しても何もしない */}
        <button type="button" className="font-mono text-sm text-muted">
          forgot password?
        </button>
      </div>
    </main>
  );
}

async function SignInFormWithNext({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  const { next } = await searchParams;
  return <SignInForm next={typeof next === "string" ? next : null} />;
}

// docs/ui.md の「読み込み中」。フォームと同じ形の枠を点滅させる
function SignInFormSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-14 rounded-md bg-surface-raised" />
      <div className="h-14 rounded-md bg-surface-raised" />
      <div className="mt-1 h-9 rounded-md bg-surface-raised" />
    </div>
  );
}
