"use client";

import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import type { GoogleAccount } from "@/server/auth/google-accounts";
import { linkGoogleAction, unlinkGoogleAction } from "./actions";

// account の枠の google の行。紐づけた Google アカウントの一覧、link google account、説明、失敗の帯
export function GoogleAccounts({
  accounts,
  linkFailed,
}: {
  accounts: GoogleAccount[];
  // Google から紐づけに失敗して戻ってきた（Settings の URL の error から決める）
  linkFailed: boolean;
}) {
  const [linking, startLink] = useTransition();
  const [unlinking, startUnlink] = useTransition();
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [error, setError] = useState<"link" | "unlink" | null>(
    linkFailed ? "link" : null,
  );

  function link() {
    startLink(async () => {
      try {
        const { result } = await linkGoogleAction();
        if (result === "error") setError("link");
      } catch (e) {
        // Google への移動（redirect）も、ここに投げられてくるので、Next.js に返す
        unstable_rethrow(e);
        // サーバーにつながらないとき
        setError("link");
      }
    });
  }

  function unlink(id: string) {
    setUnlinkingId(id);
    startUnlink(async () => {
      let failed = false;
      try {
        failed = (await unlinkGoogleAction(id)).result === "error";
      } catch {
        // サーバーにつながらないとき
        failed = true;
      }
      setError(failed ? "unlink" : null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="w-20 shrink-0 pt-1 font-mono text-xs text-muted">
          google
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {accounts.length === 0 ? (
            <p className="pt-1 text-sm text-muted">Not linked</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {accounts.map((account) => {
                const pending = unlinking && unlinkingId === account.id;
                return (
                  <li
                    key={account.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="flex min-w-0 items-center gap-1 font-mono text-sm">
                      <span aria-hidden className="icon text-base leading-none">
                        check
                      </span>
                      <span className="truncate">{account.email}</span>
                    </span>
                    <Button
                      variant="outline"
                      disabled={pending}
                      onClick={() => unlink(account.id)}
                    >
                      {pending ? "unlinking…" : "unlink"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
          <div>
            <Button variant="outline" disabled={linking} onClick={link}>
              {linking ? "linking…" : "link google account"}
            </Button>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted">
        Once linked, you can sign in with these Google accounts.
      </p>
      {error === "link" && (
        <Banner>Couldn&apos;t link your Google account. Try again.</Banner>
      )}
      {error === "unlink" && (
        <Banner>Couldn&apos;t unlink your Google account. Try again.</Banner>
      )}
    </div>
  );
}
