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

// 取り込み済みの Python（変わらない2問と、置き換わる1問）
const stored = [
  testQuestion("a1x9k2"),
  testQuestion("b4m7q1", { topic: "Generators" }),
  testQuestion("k3f9a2"),
];

// 取り込み済みに対して、増える1問・置き換わる1問（choice D）・変わらない2問になるファイル
const next = [
  testQuestion("a1x9k2"),
  testQuestion("b4m7q1", { topic: "Generators" }),
  testQuestion("k3f9a2", { choices: ["call add", "add", "None", "None"] }),
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
  await expect(page.getByRole("heading", { name: "Import" })).toBeVisible();
}

function json(questions: TestQuestion[], subject = "Python") {
  return questionFile(subject, questions);
}

test.beforeEach(async () => {
  await resetQuestions([{ name: "Python", questions: stored }]);
});

test("manage-default", async ({ page }) => {
  await page.goto("/manage");
  await expect(page).toHaveScreenshot("manage-default.png", { fullPage: true });
  await page.getByRole("link", { name: "import" }).click();
  await expect(page).toHaveURL("/manage/import");
});

test("import-select", async ({ page }) => {
  await openImport(page);
  await expect(page).toHaveScreenshot("import-select.png", { fullPage: true });
  await page.getByRole("link", { name: "manage" }).first().click();
  await expect(page).toHaveURL("/manage");
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

  await expect(page.getByText("checking…")).toBeVisible();
  await expect(page.getByRole("button", { name: "choose file" })).toHaveCount(
    0,
  );
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
    "4 problems found in python-decorators.json. Nothing was imported.",
  );
  await expect(page).toHaveScreenshot("import-errors.png", { fullPage: true });

  await page.getByRole("button", { name: "choose another file" }).click();
  await expect(page.getByText("Drop a question file here")).toBeVisible();
});

test("取り込む前の確認で、数と置き換わる問題の前と後を出し、cancel では何も変わらない", async ({
  page,
}) => {
  await openImport(page);
  await chooseFile(page, "python-decorators.json", json(next));

  await expect(page.getByRole("button", { name: "import all" })).toBeVisible();
  await expect(page).toHaveScreenshot("import-preview.png", { fullPage: true });

  await page.getByRole("button", { name: "cancel" }).click();
  await expect(page.getByText("Drop a question file here")).toBeVisible();
});

test("まだない Subject のときは new subject と出す", async ({ page }) => {
  await openImport(page);
  await chooseFile(
    page,
    "rust-basics.json",
    json([testQuestion("r1"), testQuestion("r2")], "Rust"),
  );

  await expect(page.getByRole("button", { name: "import all" })).toBeVisible();
  await expect(page.getByText("new subject")).toBeVisible();
  await expect(page).toHaveScreenshot("import-preview-new.png", {
    fullPage: true,
  });
});

test("import all で取り込み、知らせの open in manage で Manage に移る", async ({
  page,
}) => {
  await openImport(page);
  await chooseFile(page, "python-decorators.json", json(next));
  await page.getByRole("button", { name: "import all" }).click();

  await expect(page.getByText("imported into Python")).toBeVisible();
  await expect(page).toHaveScreenshot("import-done.png", { fullPage: true });

  // 取り込んだあとに同じファイルを確かめると、全部が変わらない
  await page.goto("/manage/import");
  await chooseFile(page, "python-decorators.json", json(next));
  await expect(page.getByTestId("count-unchanged")).toHaveText(/4/);

  await page.goto("/manage/import");
  await chooseFile(page, "python-decorators.json", json(next));
  await page.getByRole("button", { name: "import all" }).click();
  await page.getByRole("link", { name: "open in manage" }).click();
  await expect(page).toHaveURL("/manage");
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
    /Import failed\. Nothing was imported\./,
  );
  await expect(page.getByRole("button", { name: "choose file" })).toBeVisible();
  await expect(page).toHaveScreenshot("import-error.png", { fullPage: true });

  // つながるようにしてから retry すると、同じ中身で確かめ直す
  await page.unrouteAll();
  await page.getByRole("button", { name: "retry" }).click();
  await expect(page.getByRole("button", { name: "import all" })).toBeVisible();
});
