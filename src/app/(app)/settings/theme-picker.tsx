"use client";

import { useSyncExternalStore } from "react";
import { Segmented } from "@/components/segmented";
import {
  readTheme,
  setTheme,
  subscribeTheme,
  type Theme,
} from "@/components/theme";

const options: { value: Theme; label: React.ReactNode }[] = [
  // 2行になるときに「端末に／合わせる」で折り返す（合意したスクリーンショットのとおり）
  {
    value: "system",
    label: (
      <span className="break-keep">
        端末に
        <wbr />
        合わせる
      </span>
    ),
  },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

// 枠の中の、ラベル「テーマ」と3つ、その下の1行
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
        <span className="w-20 text-xs text-muted">テーマ</span>
        {/* Segmented のボタンは横の余白を持たず、幅いっぱいに等分して広がるので、外から幅を決めて、合意したスクリーンショットの幅（3つで約 264px）にする */}
        <div className="w-66">
          <Segmented
            label="テーマ"
            options={options}
            value={theme}
            onChange={setTheme}
          />
        </div>
      </div>
      <p className="text-xs text-muted">
        この端末に保存します。「端末に合わせる」は OS の設定に従います。
      </p>
    </div>
  );
}
