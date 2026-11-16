import { headers } from "next/headers";
import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { PageHeader } from "@/components/page-header";
import { RetryButton } from "@/components/retry-button";
import {
  type GoogleAccount,
  listGoogleAccounts,
} from "@/server/auth/google-accounts";
import { linkErrorFromGoogle } from "@/server/auth/google-errors";
import { getSession } from "@/server/auth/session";
import { GoogleAccounts } from "./google-accounts";
import { ThemePicker } from "./theme-picker";

// Settings。戻るリンク・見出しの下に account の枠と appearance の枠
export default function SettingsPage({ searchParams }: PageProps<"/settings">) {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
      <PageHeader back={{ href: "/", label: "home" }} title="Settings" />
      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs text-muted">account</h2>
        {/* 仕様では読み込み中の別の表示はないので、読み終わるまで何も出さない */}
        <Suspense fallback={null}>
          <AccountCard searchParams={searchParams} />
        </Suspense>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs text-muted">appearance</h2>
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

  let accounts: GoogleAccount[] | null;
  try {
    accounts = await listGoogleAccounts(session.user.id);
  } catch {
    accounts = null;
  }

  return (
    <div className="divide-y divide-border rounded-md border border-border bg-surface">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-20 shrink-0 font-mono text-xs text-muted">
          email
        </span>
        <span className="min-w-0 truncate font-mono text-sm">
          {session.user.email}
        </span>
      </div>
      <div className="px-4 py-3">
        {accounts ? (
          <GoogleAccounts
            accounts={accounts}
            linkFailed={linkErrorFromGoogle(
              typeof error === "string" ? error : undefined,
            )}
          />
        ) : (
          <div className="flex items-start gap-3">
            <span className="w-20 shrink-0 pt-2 font-mono text-xs text-muted">
              google
            </span>
            <div className="min-w-0 flex-1">
              <Banner action={<RetryButton />}>
                Couldn&apos;t load Google accounts.
              </Banner>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
