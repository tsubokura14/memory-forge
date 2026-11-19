import { Icon } from "@/components/icons";
import Link from "next/link";

// 画面の上の、戻るリンク・パンくず・見出し（docs/ui.md の「上のバー」の、各画面の左上の戻るリンク）。
// kicker は、パンくずの代わりに muted の太字で出す画面の種類（Setup の「study setup」）。
// title がないのは、見出しの中身（Subject の名前など）を読めなかったとき。back がないのは、戻るリンクを置かない画面（Result）
export function PageHeader({
  back,
  crumbs,
  kicker,
  title,
  children,
}: {
  back?: { href: string; label: string };
  crumbs?: string[];
  kicker?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      {back && (
        <Link
          href={back.href}
          className="flex items-center gap-1 self-start text-sm text-muted"
        >
          <Icon name="arrow-left" className="text-base" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-1">
        {crumbs && <p className="text-xs text-muted">{crumbs.join(" / ")}</p>}
        {kicker && <p className="text-xs font-bold text-muted">{kicker}</p>}
        {title && <h1 className="text-lg font-bold">{title}</h1>}
        {children}
      </div>
    </div>
  );
}
