import { pageItems } from "@/server/manage/pages";

// ページの前後のボタンと番号（docs/ui.md の「ページ」）。今のページは primary の地。
// スマホの幅では番号を出さず、前後のボタンの間に「4 / 10」を出す。1ページで収まるときは何も出さない
export function Pagination({
  page,
  last,
  onPage,
  disabled = false,
}: {
  page: number;
  last: number;
  onPage: (page: number) => void;
  disabled?: boolean;
}) {
  const items = pageItems(page, last);
  if (items.length === 0) return null;
  const box =
    "flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 font-mono text-xs disabled:opacity-50";

  return (
    <nav aria-label="pages" className="flex items-center gap-1">
      <button
        type="button"
        aria-label="previous page"
        disabled={disabled || page === 1}
        onClick={() => onPage(page - 1)}
        className={`${box} border-border bg-surface`}
      >
        <span aria-hidden className="icon text-base leading-none">
          chevron_left
        </span>
      </button>
      {items.map((item, i) =>
        item === "…" ? (
          <span
            key={`gap-${i}`}
            className="hidden px-1 font-mono text-xs text-muted sm:inline"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`page ${item}`}
            aria-current={item === page ? "page" : undefined}
            disabled={disabled}
            onClick={() => item !== page && onPage(item)}
            className={`${box} hidden sm:flex ${
              item === page
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-surface"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <span className="px-2 font-mono text-xs sm:hidden">
        {page} / {last}
      </span>
      <button
        type="button"
        aria-label="next page"
        disabled={disabled || page === last}
        onClick={() => onPage(page + 1)}
        className={`${box} border-border bg-surface`}
      >
        <span aria-hidden className="icon text-base leading-none">
          chevron_right
        </span>
      </button>
    </nav>
  );
}
