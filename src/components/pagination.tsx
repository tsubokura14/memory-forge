import { Icon } from "@/components/icons";
import { pageItems } from "@/server/manage/pages";

// ページの前後のボタンと番号（docs/ui.md の「ページ」）。今のページは primary の地。
// スマホの幅では番号を出さず、前後のボタンの間に「4 / 10」を出す。1ページで収まるときは何も出さない
export function Pagination({
  page,
  last,
  onPage,
}: {
  page: number;
  last: number;
  onPage: (page: number) => void;
}) {
  const items = pageItems(page, last);
  if (items.length === 0) return null;
  const box =
    "flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-xs tabular-nums disabled:opacity-50";

  return (
    <nav aria-label="ページ" className="flex items-center gap-1">
      <button
        type="button"
        aria-label="前のページ"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className={`${box} border-border bg-bg`}
      >
        <Icon name="chevron-left" className="text-base leading-none" />
      </button>
      {items.map((item, i) =>
        item === "…" ? (
          <span
            key={`gap-${i}`}
            className="hidden px-1 text-xs text-muted sm:inline"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`${item}ページ`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => item !== page && onPage(item)}
            className={`${box} hidden sm:flex ${
              item === page
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-bg"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <span className="px-2 text-xs tabular-nums sm:hidden">
        {page} / {last}
      </span>
      <button
        type="button"
        aria-label="次のページ"
        disabled={page === last}
        onClick={() => onPage(page + 1)}
        className={`${box} border-border bg-bg`}
      >
        <Icon name="chevron-right" className="text-base leading-none" />
      </button>
    </nav>
  );
}
