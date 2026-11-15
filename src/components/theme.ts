// テーマ（docs/design.md の「テーマ」）。選んだ値を読み書きし、<html> の data-theme を付ける処理は、ここにだけ書く

export const THEME_KEY = "theme";

// 選んだ値と OS の設定から、data-theme を付ける。
// layout.tsx の <head> のスクリプトに toString() で文字列にして埋めるので、この関数の外のもの（import や THEME_KEY）を中で使わない
function applyTheme(key: string) {
  try {
    const saved = localStorage.getItem(key);
    const dark =
      saved === "dark" ||
      (saved !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
  } catch {
    // localStorage が使えないときは、何も付けず明るい画面のまま出す
  }
}

export type Theme = "system" | "light" | "dark";

// 何も入っていない・知らない値のときは system とみなす。
// applyTheme にも同じ読み方があるが、あちらは文字列にして埋めるので、この関数を呼べない
export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

// storage イベントはほかのタブでしか起きないので、同じ画面で書いたことは自分で知らせる
const listeners = new Set<() => void>();

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 選んだ値を覚え、その場で data-theme を付け直す
export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // 覚えられなくても、今の画面の明るさだけは変えない（下で付け直すと、覚えていない値で決まる）
    return;
  }
  applyTheme(THEME_KEY);
  listeners.forEach((listener) => listener());
}

// 画面を描く前に動かすスクリプト。OS の設定が変わったときも付け直す（system でなければ、付け直しても同じ値になる）
export const themeScript = `(function(){var apply=${applyTheme.toString()};var key=${JSON.stringify(THEME_KEY)};apply(key);matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(){apply(key)})})()`;
