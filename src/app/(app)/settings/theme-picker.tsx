"use client";

import { useSyncExternalStore } from "react";
import { Segmented } from "@/components/segmented";
import {
  readTheme,
  setTheme,
  subscribeTheme,
  type Theme,
} from "@/components/theme";

const options: { value: Theme; label: string }[] = [
  { value: "system", label: "system" },
  { value: "light", label: "light" },
  { value: "dark", label: "dark" },
];

// 枠の中の、ラベル「theme」と3つ、その下の1行
export function ThemePicker() {
  // サーバーで組み立てるときは端末に覚えた値がわからないので、system にする。
  // 読み終わるまでの一瞬だけ system が選ばれて見えることがあるが、明るさは layout.tsx のスクリプトが先に決めているので、明るさはちらつかない
  const theme = useSyncExternalStore(
    subscribeTheme,
    readTheme,
    () => "system" as const,
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-20 font-mono text-xs text-muted">theme</span>
        {/* Segmented のボタンは横の余白を持たず、幅いっぱいに等分して広がるので、外から幅を決めて、合意したスクリーンショットの幅（3つで約 236px）にする */}
        <div className="w-59">
          <Segmented
            label="theme"
            options={options}
            value={theme}
            onChange={setTheme}
          />
        </div>
      </div>
      <p className="text-xs text-muted">
        Saved on this device. System follows your OS setting.
      </p>
    </div>
  );
}
