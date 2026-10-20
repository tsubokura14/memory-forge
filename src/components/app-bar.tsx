import Link from "next/link";
import { Logo } from "./logo";

// 上のバー。左にロゴ（Home へ）、右に sign out（docs/ui.md の「上のバー」）
export function AppBar({
  signOutAction,
}: {
  signOutAction: () => Promise<void>;
}) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-page items-center justify-between px-4 py-2.5">
        <Link href="/" className="flex">
          <Logo size="sm" />
        </Link>
        <form action={signOutAction} className="flex">
          <button type="submit" className="font-mono text-sm text-muted">
            sign out
          </button>
        </form>
      </div>
    </header>
  );
}
