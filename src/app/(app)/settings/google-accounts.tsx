"use client";

import { Icon } from "@/components/icons";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import type { GoogleAccount } from "@/server/auth/google-accounts";
import { linkGoogleAction, unlinkGoogleAction } from "./actions";

// account の枠の google の行。自分の Google アカウント、足した Google アカウントの一覧、link google account、説明、失敗の帯
export function GoogleAccounts({
  owner,
  accounts,
  linkFailed,
}: {
  // 自分の Google アカウントのメールアドレス。外せないので unlink を置かない
  owner: string;
  // Settings で足した Google アカウント
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
        <span className="w-20 shrink-0 pt-1 text-xs text-muted">Google</span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ul className="flex flex-col gap-2">
            {/* 外すがなくても、ほかの行（md のボタンの高さ）とそろえる */}
            <li className="flex min-h-9.5 min-w-0 items-center gap-1 text-sm">
              <Icon name="check" className="text-base leading-none" />
              <span className="truncate">{owner}</span>
            </li>
            {accounts.map((account) => {
              const pending = unlinking && unlinkingId === account.id;
              return (
                <li
                  key={account.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 items-center gap-1 text-sm">
                    <Icon name="check" className="text-base leading-none" />
                    <span className="truncate">{account.email}</span>
                  </span>
                  <Button
                    variant="outline"
                    disabled={pending}
                    onClick={() => unlink(account.id)}
                  >
                    {pending ? "外しています…" : "外す"}
                  </Button>
                </li>
              );
            })}
          </ul>
          <div>
            <Button variant="outline" disabled={linking} onClick={link}>
              {linking ? "紐づけています…" : "Google アカウントを紐づける"}
            </Button>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted">
        紐づけた Google アカウントでも、ログインできます。
      </p>
      {error === "link" && (
        <Banner>
          Google アカウントを紐づけられませんでした。もう一度試してください。
        </Banner>
      )}
      {error === "unlink" && (
        <Banner>
          Google アカウントを外せませんでした。もう一度試してください。
        </Banner>
      )}
    </div>
  );
}
