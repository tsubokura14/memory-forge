import { Icon, type IconName } from "@/components/icons";

// 外のページ（GitHub のドキュメントなど）へのリンク。docs/ui.md の「外のページへのリンク」。
// 左の印は accent の色、右に external-link の印を置き、別のタブで開く
export function ExternalLink({
  href,
  icon,
  title,
  description,
  className = "",
}: {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-md border border-border bg-bg px-4 py-3 hover:bg-surface ${className}`}
    >
      <Icon name={icon} className="text-lg text-accent" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm">{title}</span>
        <span className="text-xs text-muted">{description}</span>
      </span>
      <Icon name="external-link" className="text-base text-muted" />
    </a>
  );
}
