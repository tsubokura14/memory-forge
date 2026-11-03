"use client";

import { useEffect, useRef } from "react";

// 確かめのダイアログ（docs/ui.md の「浮かせて重ねるもの」）。ブラウザの <dialog> を showModal で開き、後ろの画面を押せなくする。
// Esc は onCancel（閉じる側のボタンと同じ）。外側を押しても閉じない
export function Dialog({
  open,
  title,
  description,
  actions,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  actions: React.ReactNode;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        // ブラウザに閉じさせず、open を持つ側に閉じさせる
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-full max-w-sm rounded-md border border-border bg-surface p-5 text-text shadow-popover backdrop:bg-backdrop"
    >
      <h2 id="dialog-title" className="text-lg">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-5 flex justify-end gap-2">{actions}</div>
    </dialog>
  );
}
