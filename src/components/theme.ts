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

// 画面を描く前に動かすスクリプト。OS の設定が変わったときも付け直す（system でなければ、付け直しても同じ値になる）
export const themeScript = `(function(){var apply=${applyTheme.toString()};var key=${JSON.stringify(THEME_KEY)};apply(key);matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(){apply(key)})})()`;
