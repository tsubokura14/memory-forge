import Link from "next/link";

// 画面の上の、戻るリンク・パンくず・見出し（docs/ui.md の「上のバー」の、各画面の左上の戻るリンク）
export function PageHeader({
  back,
  crumbs,
  title,
  children,
}: {
  back: { href: string; label: string };
  crumbs?: string[];
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href={back.href}
        className="flex items-center gap-1 self-start font-mono text-sm text-muted"
      >
        <span aria-hidden className="icon text-base">
          arrow_back
        </span>
        {back.label}
      </Link>
      <div className="flex flex-col gap-1">
        {crumbs && (
          <p className="font-mono text-xs text-muted">{crumbs.join(" / ")}</p>
        )}
        <h1 className="text-lg">{title}</h1>
        {children}
      </div>
    </div>
  );
}
