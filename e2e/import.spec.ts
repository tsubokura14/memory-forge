import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import {
  questionFile,
  resetQuestions,
  type TestQuestion,
  testQuestion,
} from "./questions";
import { SIGNED_IN_STATE } from "./test-user";

test.use({ storageState: SIGNED_IN_STATE });

// k3f9a2 の問題文。前と後で、コードの最後の行だけが違う
const fence = "```";
function decoratorText(lastLine: string) {
  return [
    "次のコードを実行したとき、出力されるものはどれか。",
    "",
    `${fence}python`,
    "def logger(func):",
    "    def wrapper(*args, **kwargs):",
    '        print(f"call {func.__name__}")',
    "        return func(*args, **kwargs)",
    "    return wrapper",
    "",
    "@logger",
    "def add(a, b):",
    "    return a + b",
    "",
    lastLine,
    fence,
  ].join("\n");
}

// 取り込み済みの Python（k3f9a2 は印付き）
const stored = [
  testQuestion("a1x9k2"),
  testQuestion("b4m7q1", { topic: "Generators" }),
  testQuestion("k3f9a2", {
    text: decoratorText("print(add(1, 2))"),
    flagged: true,
  }),
];

// 取り込み済みに対して、増える1問・置き換わる2問（問題文と choice D・解説）・変わらない1問になるファイル。
// 取り込む前の確認では、ファイルの順番で最初の置き換わる問題（k3f9a2）が開く
const next = [
  testQuestion("k3f9a2", {
    text: decoratorText("print(add.__name__)"),
    choices: ["call add", "add", "None", "None"],
  }),
  testQuestion("a1x9k2"),
  testQuestion("b4m7q1", {
    topic: "Generators",
    explanation: "ジェネレータは yield で値を1つずつ返す。",
  }),
  testQuestion("n5p2r8", { topic: "Generators" }),
];

async function chooseFile(page: Page, name: string, content: string) {
  await page.getByTestId("file-input").setInputFiles({
    name,
    mimeType: "application/json",
    buffer: Buffer.from(content),
  });
}

// サーバーアクションの通信（next-action の付いた POST）だけを選ぶ
function isServerAction(request: { method(): string; headers(): object }) {
  return request.method() === "POST" && "next-action" in request.headers();
}

async function openImport(page: Page) {
  await page.goto("/manage/import");
  await expect(page.getByRole("heading", { name: "取り込み" })).toBeVisible();
}

function json(questions: TestQuestion[], subject = "Python") {
  return questionFile(subject, questions);
}

test.beforeEach(async () => {
  await resetQuestions([{ name: "Python", questions: stored }]);
});

test("import-select", async ({ page }) => {
  await openImport(page);
  await expect(page).toHaveScreenshot("import-select.png", { fullPage: true });
});

test("作り方のリンクは、main の docs/questions.md を別のタブで開く", async ({
  page,
}) => {
  await openImport(page);
  const link = page.getByRole("link", { name: /問題のファイルの作り方/ });
  await expect(link).toHaveAttribute(
    "href",
    "https://github.com/tsubokura14/memory-forge/blob/main/docs/questions.md",
  );
  await expect(link).toHaveAttribute("target", "_blank");
});

test("確かめている間は、ファイル名と checking… を出し、ファイルを選べない", async ({
  page,
}) => {
  // 返事を返さずに止めて、確かめている間の画面を撮る
  await page.route(
    (url) => url.pathname === "/manage/import",
    async (route) => {
      if (!isServerAction(route.request())) await route.continue();
    },
  );
  await openImport(page);
  await chooseFile(page, "python-decorators.json", json(next));

  await expect(page.getByText("確かめています…")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ファイルを選ぶ" }),
  ).toHaveCount(0);
  await expect(page).toHaveScreenshot("import-checking.png", {
    fullPage: true,
  });
});

test("誤りがあると、誤りの数と一覧を出し、何も取り込まない", async ({
  page,
}) => {
  await openImport(page);
  await chooseFile(
    page,
    "python-decorators.json",
    json([
      testQuestion("p81xq0", { type: "multiple", correct: ["A"] }),
      testQuestion("k3f9a2"),
      testQuestion("k3f9a2"),
      testQuestion("m2v7c4", { explanation: "" }),
      testQuestion("z9d1e8", { text: "```python\nprint(1)" }),
    ]),
  );

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "4 件の不備が python-decorators.json にあります。何も取り込んでいません。",
  );
  await expect(page).toHaveScreenshot("import-errors.png", { fullPage: true });

  await page.getByRole("button", { name: "別のファイルを選ぶ" }).click();
  await expect(
    page.getByText("問題のファイルをここに置いてください"),
  ).toBeVisible();
});

test("取り込む前の確認で、数と置き換わる問題の前と後を出し、cancel では何も変わらない", async ({
  page,
}) => {
  await openImport(page);
  await chooseFile(page, "python-decorators.json", json(next));

  await expect(
    page.getByRole("button", { name: "すべて取り込む" }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("import-preview.png", { fullPage: true });

  await page.getByRole("button", { name: "やめる" }).click();
  await expect(
    page.getByText("問題のファイルをここに置いてください"),
  ).toBeVisible();
});

test("まだない Subject のときは new subject と出す", async ({ page }) => {
  await openImport(page);
  await chooseFile(
    page,
    "rust-basics.json",
    json([testQuestion("r1"), testQuestion("r2")], "Rust"),
  );

  await expect(
    page.getByRole("button", { name: "すべて取り込む" }),
  ).toBeVisible();
  await expect(page.getByText("新しい科目")).toBeVisible();
  await expect(page).toHaveScreenshot("import-preview-new.png", {
    fullPage: true,
  });
});

test("import all で取り込み、取り込んだという知らせを出す", async ({
  page,
}) => {
  await openImport(page);
  await chooseFile(page, "python-decorators.json", json(next));
  await page.getByRole("button", { name: "すべて取り込む" }).click();

  await expect(page.getByText("Python に取り込みました")).toBeVisible();
  await expect(page).toHaveScreenshot("import-done.png", { fullPage: true });
});

test("サーバーにつながらないと、帯と retry を出し、ファイルを選び直せる", async ({
  page,
}) => {
  await page.route(
    (url) => url.pathname === "/manage/import",
    async (route) => {
      if (isServerAction(route.request())) await route.abort();
      else await route.continue();
    },
  );
  await openImport(page);
  await chooseFile(page, "python-decorators.json", json(next));

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    /取り込めませんでした。何も取り込んでいません。/,
  );
  await expect(
    page.getByRole("button", { name: "ファイルを選ぶ" }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("import-error.png", { fullPage: true });

  // つながるようにしてから retry すると、同じ中身で確かめ直す
  await page.unrouteAll();
  await page.getByRole("button", { name: "もう一度取り込む" }).click();
  await expect(
    page.getByRole("button", { name: "すべて取り込む" }),
  ).toBeVisible();
});
