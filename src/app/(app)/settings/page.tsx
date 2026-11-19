import { headers } from "next/headers";
import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { PageHeader } from "@/components/page-header";
import { RetryButton } from "@/components/retry-button";
import {
  type GoogleAccount,
  listGoogleAccounts,
  splitGoogleAccounts,
} from "@/server/auth/google-accounts";
import { linkErrorFromGoogle } from "@/server/auth/google-errors";
import { getSession } from "@/server/auth/session";
import { GoogleAccounts } from "./google-accounts";
import { ThemePicker } from "./theme-picker";

// Settings。戻るリンク・見出しの下に アカウントの枠と見た目の枠
export default function SettingsPage({ searchParams }: PageProps<"/settings">) {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
      <PageHeader back={{ href: "/", label: "ホームへ戻る" }} title="設定" />
      <section className="flex flex-col gap-2">
        <h2 className="text-xs text-muted">アカウント</h2>
        {/* 仕様では読み込み中の別の表示はないので、読み終わるまで何も出さない */}
        <Suspense fallback={null}>
          <AccountCard searchParams={searchParams} />
        </Suspense>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xs text-muted">見た目</h2>
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <ThemePicker />
        </div>
      </section>
    </main>
  );
}

async function AccountCard({
  searchParams,
}: Pick<PageProps<"/settings">, "searchParams">) {
  const { session } = await getSession(await headers());
  // proxy がログインしていない人を Login に移すので、ここには来ない
  if (!session) return null;
  const { error } = await searchParams;

  let google: { owner: string; added: GoogleAccount[] } | null;
  try {
    google = splitGoogleAccounts(
      session.user.email,
      await listGoogleAccounts(session.user.id),
    );
  } catch {
    google = null;
  }

  return (
    <div className="divide-y divide-border rounded-md border border-border bg-surface">
      <div className="px-4 py-3">
        {google ? (
          <GoogleAccounts
            owner={google.owner}
            accounts={google.added}
            linkFailed={linkErrorFromGoogle(
              typeof error === "string" ? error : undefined,
            )}
          />
        ) : (
          <div className="flex items-start gap-3">
            <span className="w-20 shrink-0 pt-2 text-xs text-muted">
              Google
            </span>
            <div className="min-w-0 flex-1">
              <Banner action={<RetryButton />}>
                Google アカウントを読み込めませんでした。
              </Banner>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
