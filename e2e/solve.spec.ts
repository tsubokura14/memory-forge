import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { resetQuestions, type TestQuestion, testQuestion } from "./questions";
import { SIGNED_IN_STATE } from "./test-user";

test.use({ storageState: SIGNED_IN_STATE });

// topic の問題を n 問作る。ID は topic の頭文字と番号
function topicQuestions(topic: string, n: number): TestQuestion[] {
  return Array.from({ length: n }, (_, i) =>
    testQuestion(`${topic.slice(0, 3).toLowerCase()}${i + 1}`, { topic }),
  );
}

// 使う場面の Python（Basics 3問・Decorators 12問・Generators 8問・Typing 8問・Async 4問）
const python = [
  ...topicQuestions("Basics", 3),
  ...topicQuestions("Decorators", 12),
  ...topicQuestions("Generators", 8),
  ...topicQuestions("Typing", 8),
  ...topicQuestions("Async", 4),
];

// Subject を入れ直し、その Setup を開いて、読み終えるのを待つ
async function openSetup(page: Page, questions: TestQuestion[]) {
  const [id] = await resetQuestions([{ name: "Python", questions }]);
  await page.goto(`/subjects/${id}`);
  await expect(page.getByTestId("setup-loading")).toHaveCount(0);
}

function start(page: Page) {
  return page.getByRole("button", { name: /^start/ });
}

test("setup-default：All・in order・10 を選んで、start · 10", async ({
  page,
}) => {
  await openSetup(page, python);
  await expect(page.getByRole("heading", { name: "Python" })).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "All", exact: true }),
  ).toBeChecked();
  await expect(page.getByRole("radio", { name: "in order" })).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "10", exact: true }),
  ).toBeChecked();
  await expect(start(page)).toHaveText("start · 10");
  await expect(page).toHaveScreenshot("setup-default.png", { fullPage: true });
});

test("setup-few：Topic の問題が足りないと、Topic の名前で案内し、ある分の数を添える", async ({
  page,
}) => {
  await openSetup(page, python);
  await page.getByRole("radio", { name: "Typing" }).click();
  await expect(
    page.getByText("Typing has only 8 questions to ask."),
  ).toBeVisible();
  await expect(start(page)).toHaveText("start · 8");
  await expect(page).toHaveScreenshot("setup-few.png", { fullPage: true });
});

test("All で問題が足りないと、Subject の名前で案内する", async ({ page }) => {
  await openSetup(page, topicQuestions("Basics", 3));
  await expect(
    page.getByText("Python has only 3 questions to ask."),
  ).toBeVisible();
  await expect(start(page)).toHaveText("start · 3");
});

test("setup-unanswered：lowest accuracy で解いた問題がないと、理由を出し、start を押せない", async ({
  page,
}) => {
  await openSetup(page, python);
  await page.getByRole("radio", { name: "Typing" }).click();
  await page.getByRole("radio", { name: "lowest accuracy" }).click();
  await expect(
    page.getByText(
      "No questions to ask — none in Typing have been answered yet.",
    ),
  ).toBeVisible();
  await expect(start(page)).toHaveText("start · 0");
  await expect(start(page)).toBeDisabled();
  await expect(page).toHaveScreenshot("setup-unanswered.png", {
    fullPage: true,
  });
});

test("setup-many：Topic が多いと、行が続く", async ({ page }) => {
  await openSetup(
    page,
    Array.from({ length: 30 }, (_, i) =>
      testQuestion(`m${i + 1}`, {
        topic: `Topic ${String(i + 1).padStart(2, "0")}`,
      }),
    ),
  );
  await expect(page.getByRole("radio", { name: "Topic 30" })).toBeVisible();
  await expect(page).toHaveScreenshot("setup-many.png", { fullPage: true });
});

test("ない Subject の Setup は、見つからない画面を出す", async ({ page }) => {
  await resetQuestions();
  await page.goto("/subjects/999999");
  // 読み込みを流し込む途中で見つからないとわかるので、HTTP の状態ではなく、出した中身で確かめる
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
