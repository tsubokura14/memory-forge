import Link from "next/link";
import { Logo } from "./logo";

// 上のバー。左にロゴ（Home へ）、右にログアウト（docs/ui.md の「上のバー」）
export function AppBar({
  signOutAction,
}: {
  signOutAction: () => Promise<void>;
}) {
  return (
    <header className="border-b border-border bg-bg">
      <div className="mx-auto flex max-w-page items-center justify-between px-4 py-3">
        <Link href="/" className="flex">
          <Logo size="sm" />
        </Link>
        <form action={signOutAction} className="flex">
          <button type="submit" className="text-sm text-muted">
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}
