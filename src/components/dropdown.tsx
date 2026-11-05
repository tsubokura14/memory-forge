"use client";

import { useEffect, useId, useRef, useState } from "react";

export type DropdownOption = {
  key: string;
  label: string;
  count: number;
  // 下に区切り線を引く（Topic の「All topics」）
  divider?: boolean;
};

// プルダウン（docs/ui.md の「プルダウン」）。押すと下に一覧を開き、選ぶ・Esc・外側を押すと閉じる。
// 開いている間は枠を primary にし、右の印を上向きにする。一覧の高さは止めて、中をスクロールさせる
export function Dropdown({
  label,
  options,
  selected,
  onSelect,
  className = "",
}: {
  label: string;
  options: DropdownOption[];
  selected: string;
  onSelect: (key: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.key === selected);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-left text-sm ${
          open ? "border-primary bg-surface" : "border-border bg-surface-raised"
        }`}
      >
        <span className="truncate">{current?.label}</span>
        <span aria-hidden className="icon text-lg leading-none text-muted">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute top-full right-0 left-0 z-10 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-popover"
        >
          {options.map((option) => {
            const isSelected = option.key === selected;
            return (
              <li
                key={option.key}
                className={
                  option.divider ? "mb-1 border-b border-border" : ""
                }
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setOpen(false);
                    if (!isSelected) onSelect(option.key);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                    isSelected
                      ? "bg-primary-soft text-primary"
                      : "hover:bg-surface-raised"
                  }`}
                >
                  <span aria-hidden className="icon w-4 text-base leading-none">
                    {isSelected ? "check" : ""}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {option.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
