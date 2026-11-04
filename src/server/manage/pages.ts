// Manage の問題の一覧のページ（docs/ui.md の「ページ」）。データベースは使わない（画面の部品から読む）

export const PAGE_SIZE = 50;

// 問題が0問のときも、1ページとして数える
export function lastPage(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

// ページの番号の並び。最初・最後・今の前後だけを出し、間に番号が1つでも抜けるところは「…」にする。
// 1ページで収まるときは、前後のボタンも番号も出さないので空
export function pageItems(current: number, last: number): (number | "…")[] {
  if (last <= 1) return [];
  const shown = [1, current - 1, current, current + 1, last].filter(
    (n, i, all) => n >= 1 && n <= last && all.indexOf(n) === i,
  );
  shown.sort((a, b) => a - b);
  const items: (number | "…")[] = [];
  for (const n of shown) {
    const previous = items.at(-1);
    if (typeof previous === "number" && n > previous + 1) items.push("…");
    items.push(n);
  }
  return items;
}

// 「151–200 of 480」。最後のページは、全部の数で止める
export function rangeText(page: number, total: number): string {
  const first = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  return `${first}–${end} of ${total}`;
}
