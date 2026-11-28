// 問題文・選択肢・解説の Markdown を、kinari-md で HTML にする。
// サーバーでだけ呼び、画面の部品から読み込まない（docs/design.md の「問題文・選択肢・解説の表示」）
import { renderMarkdown } from "kinari-md/markdown";

export type RenderedChoice = { html: string; hasCode: boolean };

export function renderQuestionText(text: string): string {
  return renderMarkdown(text, { syntax: "code", lineNumbers: true }).html;
}

export function renderChoice(text: string): RenderedChoice {
  const { html } = renderMarkdown(text, { syntax: "code" });
  // 文の中の "<pre" は文字として符号化されるので、ここに当たるのはコードブロックだけ
  return { html, hasCode: html.includes("<pre") };
}

// drawMermaid は呼ばない。```mermaid はコードブロックのまま出す（図を描く予定がまだないため）
export function renderExplanation(text: string): string {
  return renderMarkdown(text, { syntax: "all" }).html;
}
