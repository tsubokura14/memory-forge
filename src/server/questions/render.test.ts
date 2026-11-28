import { describe, expect, test } from "vitest";
import { renderChoice, renderExplanation, renderQuestionText } from "./render";

const code = (language: string, body: string) =>
  ["```" + language, body, "```"].join("\n");

// タグを外した文字（ブラウザで選んで写したときに入る文字に近い）
const textOf = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replaceAll("&#x3C;", "<")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"');

const colored = /class="hljs-(keyword|string|comment)"/;

describe("renderQuestionText", () => {
  test("段落・改行・文の中のコードを HTML にする", () => {
    const html = renderQuestionText("1行目\n`sort()` を使う。\n\n次の段落");
    expect(html).toContain("<p>1行目<br>");
    expect(html).toContain("<code>sort()</code>");
    expect(html).toContain("<p>次の段落</p>");
  });

  test("強調・見出し・リストは、書いたままの文字で出す", () => {
    const html = renderQuestionText("**太字**\n\n# 見出し\n\n- 項目");
    expect(html).not.toMatch(/<strong|<h1|<ul|<li/);
    expect(html).toContain("**太字**");
    expect(html).toContain("# 見出し");
    expect(html).toContain("- 項目");
  });

  test("コードブロックに行番号の作りを付け、HTML の文字には番号を入れない", () => {
    const html = renderQuestionText(
      code("python", "a = 1\nb = 2\nprint(a + b)"),
    );
    expect(html).toContain('class="line-numbers"');
    expect(html.match(/class="code-line"/g)).toHaveLength(3);
    expect(textOf(html).trim()).toBe("a = 1\nb = 2\nprint(a + b)");
  });

  test("言語の名前は画面の文字に出さない", () => {
    const html = renderQuestionText(code("python", "x = 1"));
    expect(textOf(html)).not.toContain("python");
  });
});

describe("renderChoice", () => {
  test("問題文と同じ書き方だけを HTML にし、ほかは書いたまま", () => {
    const { html } = renderChoice("`map` と **filter**");
    expect(html).toContain("<code>map</code>");
    expect(html).toContain("**filter**");
  });

  test("コードブロックに行番号は付けない。hasCode は true", () => {
    const { html, hasCode } = renderChoice(code("python", "print(1)"));
    expect(html).toContain("<pre>");
    expect(html).not.toContain("line-numbers");
    expect(html).not.toContain("code-line");
    expect(hasCode).toBe(true);
  });

  test("文の中のコードだけなら hasCode は false", () => {
    expect(renderChoice("`<pre>` を使う").hasCode).toBe(false);
  });
});

describe("renderExplanation", () => {
  test("強調・リスト・表・引用・コールアウト・数式・リンクを HTML にする", () => {
    const html = renderExplanation(
      [
        "**太字**",
        "",
        "- 項目",
        "",
        "| a | b |",
        "| - | - |",
        "| 1 | 2 |",
        "",
        "> 引用",
        "",
        "> [!tip] ヒント",
        "> 中身",
        "",
        "$x^2$",
        "",
        "[公式](https://example.com)",
      ].join("\n"),
    );
    expect(html).toContain("<strong>太字</strong>");
    expect(html).toContain("<li>項目</li>");
    expect(html).toContain("<table>");
    expect(html).toContain("<blockquote>");
    expect(html).toContain('data-callout="tip"');
    expect(html).toContain('class="katex"');
    expect(html).toContain('href="https://example.com"');
  });

  // pre に data-mermaid の印は付くが、図に描くのはブラウザの drawMermaid なので、呼ばなければコードブロックのまま
  test("mermaid のコードブロックは、図にせずコードブロックのまま出す", () => {
    const html = renderExplanation(code("mermaid", "graph TD; A-->B"));
    expect(html).toMatch(/<pre[^>]*><code class="language-mermaid">/);
    expect(html).not.toContain("<svg");
    expect(textOf(html)).toContain("graph TD; A-->B");
  });
});

describe("コードの色", () => {
  const samples: Record<string, string> = {
    python: "def f(): # c",
    py: "def f(): # c",
    typescript: "const a = 'x';",
    ts: "const a = 'x';",
    javascript: "const a = 'x';",
    js: "const a = 'x';",
    sql: "SELECT 'x' FROM t;",
    bash: "echo 'x' # c",
    sh: "echo 'x' # c",
    shell: "$ echo 'x'",
    json: '{ "a": "x" }',
  };

  test.each(Object.entries(samples))("%s に色を付ける", (language, body) => {
    expect(renderQuestionText(code(language, body))).toMatch(colored);
    expect(renderChoice(code(language, body)).html).toMatch(colored);
  });

  test("言語の名前がないときと、知らない言語のときは色を付けない", () => {
    expect(renderQuestionText(code("", "def f(): # c"))).not.toContain("hljs-");
    expect(
      renderQuestionText(code("nosuchlang", "def f(): # c")),
    ).not.toContain("hljs-");
  });
});

describe("安全にする", () => {
  test("HTML のタグは文字のまま出す", () => {
    for (const html of [
      renderQuestionText("<script>alert(1)</script>"),
      renderChoice("<script>alert(1)</script>").html,
      renderExplanation("<script>alert(1)</script>"),
    ]) {
      expect(html).not.toContain("<script>");
      expect(textOf(html)).toContain("<script>alert(1)</script>");
    }
  });

  test("javascript: のリンクは通さない", () => {
    const html = renderExplanation("[x](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });
});
