"use client";

import { useEffect, useId, useRef } from "react";

// 確かめのダイアログ（docs/ui.md の「ダイアログ」）。ブラウザの <dialog> を showModal で開き、後ろの画面を押せなくする。
// lead は説明の上に出すもの（1問の削除の問題文の1行目）、children は説明の下に出すもの（消せなかったときの帯）
export function Dialog({
  open,
  title,
  lead,
  description,
  children,
  actions,
  onCancel,
}: {
  open: boolean;
  title: string;
  lead?: React.ReactNode;
  description: string;
  children?: React.ReactNode;
  actions: React.ReactNode;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // ブラウザに閉じさせず、open を持つ側に閉じさせる
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-full max-w-sm rounded-md border border-border bg-surface p-5 text-text shadow-popover backdrop:bg-backdrop"
    >
      <h2 id={titleId} className="text-lg">
        {title}
      </h2>
      {lead && <div className="mt-2 text-sm">{lead}</div>}
      <p className="mt-2 text-sm text-muted">{description}</p>
      {children && <div className="mt-4">{children}</div>}
      <div className="mt-5 flex justify-end gap-2">{actions}</div>
    </dialog>
  );
}
