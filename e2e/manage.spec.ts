import type { Download, Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import {
  insertAnswers,
  resetQuestions,
  type TestQuestion,
  testQuestion,
} from "./questions";
import { SIGNED_IN_STATE } from "./test-user";

test.use({ storageState: SIGNED_IN_STATE });

// 合意したスクリーンショットと同じ10問（Python）
const python: TestQuestion[] = [
  [
    "k3f9a2",
    "Decorators",
    "single",
    "次のコードを実行したとき、出力されるものはどれか。",
  ],
  [
    "p81xq0",
    "Decorators",
    "multiple",
    "functools.wraps について、正しいものをすべて選べ。",
  ],
  [
    "m2v7c4",
    "Decorators",
    "single",
    "デコレータを重ねて付けたとき、適用される順番はどれか。",
  ],
  [
    "z9d1e8",
    "Generators",
    "single",
    "ジェネレータの中で yield from がすることはどれか。",
  ],
  [
    "b4n6t1",
    "Generators",
    "multiple",
    "ジェネレータオブジェクトを作るものをすべて選べ。",
  ],
  [
    "h7r2w5",
    "Basics",
    "single",
    "ミュータブルな値をデフォルト引数にしたとき、起こることはどれか。",
  ],
  ["c0y8u3", "Basics", "multiple", "イミュータブルな型をすべて選べ。"],
  ["e5s4j9", "Typing", "single", "TypedDict でできることはどれか。"],
  ["t1g6l7", "Async", "single", "asyncio.gather が返すものはどれか。"],
  ["w8a3k2", "Async", "multiple", "await について、正しいものをすべて選べ。"],
].map(([id, topic, type, text]) =>
  testQuestion(id, {
    topic,
    type: type as TestQuestion["type"],
    text,
    correct: type === "multiple" ? ["A", "B"] : ["C"],
  }),
);

// 問題ごとの [正解の数, 不正解の数]
const records: Record<string, [number, number]> = {
  k3f9a2: [1, 0],
  p81xq0: [1, 1],
  m2v7c4: [2, 1],
  b4n6t1: [3, 1],
  h7r2w5: [1, 2],
  c0y8u3: [4, 1],
  t1g6l7: [2, 2],
  w8a3k2: [2, 1],
};

function many(prefix: string, count: number): TestQuestion[] {
  return Array.from({ length: count }, (_, i) =>
    testQuestion(`${prefix}${i + 1}`, { topic: "Basics" }),
  );
}

// 合意したスクリーンショットで印の付いている問題
const flaggedIds = ["p81xq0", "c0y8u3"];

async function resetPython(
  extraTopics: string[] = [],
  flagged: string[] = flaggedIds,
) {
  await resetQuestions([
    {
      name: "Python",
      questions: [
        ...python.map((q) => ({ ...q, flagged: flagged.includes(q.id) })),
        ...extraTopics.map((topic, i) =>
          testQuestion(`x${i + 1}`, { topic, text: `${topic} の問題文` }),
        ),
      ],
    },
    { name: "AWS SAA", questions: many("aws", 240) },
    {
      name: "TypeScript",
      questions: many("ts", 72).map((q, i) => ({ ...q, flagged: i < 3 })),
    },
    { name: "Linux", questions: many("linux", 30) },
  ]);
  await insertAnswers(
    Object.entries(records).flatMap(([questionId, [right, wrong]]) => [
      ...Array.from({ length: right }, () => ({ questionId, correct: true })),
      ...Array.from({ length: wrong }, () => ({ questionId, correct: false })),
    ]),
  );
}

// 480問（10問を48回くり返す）の Python
async function resetManyPython() {
  await resetQuestions([
    {
      name: "Python",
      questions: Array.from({ length: 48 }, (_, round) =>
        python.map((q) => ({ ...q, id: `${q.id}${round + 100}` })),
      ).flat(),
    },
  ]);
}

// サーバーアクションの通信（next-action の付いた POST）だけを選ぶ
function isServerAction(request: { method(): string; headers(): object }) {
  return request.method() === "POST" && "next-action" in request.headers();
}

function dropdown(page: Page, name: "subject" | "topic") {
  return page.getByRole("button", { name, exact: true });
}

async function choose(page: Page, name: "subject" | "topic", option: string) {
  await dropdown(page, name).click();
  await page.getByRole("option", { name: new RegExp(`^${option}`) }).click();
}

// Next.js が置く、ページの移動を知らせる alert と分けるため、main の中で探す
function loadError(page: Page) {
  return page.getByRole("main").getByRole("alert");
}

function rows(page: Page) {
  return page.getByRole("list", { name: "questions" }).getByRole("listitem");
}

async function openManage(page: Page) {
  await page.goto("/manage");
  await expect(rows(page).first()).toBeVisible();
}

function flaggedButton(page: Page) {
  return page.getByRole("button", { name: "flagged", exact: true });
}

function unflag(page: Page, questionId: string) {
  return rows(page)
    .filter({ hasText: questionId })
    .getByRole("button", { name: "unflag" });
}

// 保存されたファイルの中身を JSON として読む
async function readJson(file: Download) {
  const chunks = await (await file.createReadStream()).toArray();
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

test("manage-default：開くと、最初の Subject と All topics の1ページ目", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await expect(dropdown(page, "subject")).toHaveText(/Python/);
  await expect(dropdown(page, "topic")).toHaveText(/All topics/);
  await expect(rows(page)).toHaveCount(10);
  await expect(page).toHaveScreenshot("manage-default.png", { fullPage: true });
});

test("manage-subject-open", async ({ page }) => {
  await resetPython();
  await openManage(page);
  await dropdown(page, "subject").click();
  await expect(page.getByRole("option")).toHaveCount(4);
  await expect(page).toHaveScreenshot("manage-subject-open.png", {
    fullPage: true,
  });
});

test("manage-topic-open：Topic を選ぶと、その問題だけになる", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await choose(page, "topic", "Decorators");
  await expect(rows(page)).toHaveCount(3);
  await dropdown(page, "topic").click();
  await expect(page).toHaveScreenshot("manage-topic-open.png", {
    fullPage: true,
  });
});

test("manage-topics-many", async ({ page }) => {
  await resetPython([
    "Closures",
    "Comprehensions",
    "Context managers",
    "Dataclasses",
    "Exceptions",
    "Iterators",
    "Modules",
    "Testing",
  ]);
  await openManage(page);
  await dropdown(page, "topic").click();
  await expect(page).toHaveScreenshot("manage-topics-many.png", {
    fullPage: true,
  });
});

test("manage-empty", async ({ page }) => {
  await resetQuestions();
  await page.goto("/manage");
  await expect(page.getByText("No subjects yet.")).toBeVisible();
  await expect(dropdown(page, "subject")).toHaveCount(0);
  await expect(page).toHaveScreenshot("manage-empty.png", { fullPage: true });
});

test("manage-many：ページを移ると、その50問になる", async ({ page }) => {
  await resetManyPython();
  await openManage(page);
  // 番号は今のページの前後だけなので、2・3と順に移る
  await page.getByRole("button", { name: "page 2" }).click();
  await expect(page.getByText("51–100 of 480")).toBeVisible();
  await page.getByRole("button", { name: "page 3" }).click();
  await expect(page.getByText("101–150 of 480")).toBeVisible();
  await page.getByRole("button", { name: "page 4" }).click();
  await expect(page.getByText("151–200 of 480")).toBeVisible();
  await expect(rows(page)).toHaveCount(50);
  await expect(page).toHaveScreenshot("manage-many.png", { fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText("4 / 10")).toBeVisible();
  await expect(page).toHaveScreenshot("manage-many-mobile.png", {
    fullPage: true,
  });
});

test("Subject を変えると All topics と1ページ目に戻り、読み込み直しても Home から戻っても同じ選び方のまま", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await choose(page, "subject", "AWS SAA");
  await page.getByRole("button", { name: "page 2" }).click();
  await expect(page.getByText("51–100 of 240")).toBeVisible();

  await choose(page, "subject", "Python");
  await choose(page, "topic", "Typing");
  await expect(rows(page)).toHaveCount(1);
  await choose(page, "subject", "AWS SAA");
  await expect(dropdown(page, "topic")).toHaveText(/All topics/);
  await expect(page.getByText("1–50 of 240")).toBeVisible();

  await page.getByRole("button", { name: "page 2" }).click();
  await expect(page.getByText("51–100 of 240")).toBeVisible();
  await page.reload();
  await expect(page.getByText("51–100 of 240")).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: /manage/ }).click();
  await expect(dropdown(page, "subject")).toHaveText(/AWS SAA/);
  await expect(page.getByText("51–100 of 240")).toBeVisible();
});

test("manage-loading：選び方を変えて読み込んでいる間は、行の形の枠を点滅させる", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  // 返事を返さずに止めて、読み込み中の画面を撮る
  await page.route("/manage", async (route) => {
    if (!isServerAction(route.request())) await route.continue();
  });
  await choose(page, "topic", "Decorators");
  await expect(page.getByTestId("questions-loading")).toBeVisible();
  await expect(page).toHaveScreenshot("manage-loading.png", { fullPage: true });
});

test("manage-error：読み込めなかったら帯と retry を出し、retry で出る", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await page.route("/manage", (route) =>
    isServerAction(route.request()) ? route.abort() : route.continue(),
  );
  await choose(page, "topic", "Decorators");
  await expect(loadError(page)).toHaveText(/Couldn't load questions\./);
  await expect(page).toHaveScreenshot("manage-error.png", { fullPage: true });

  await page.unrouteAll();
  await page.getByRole("button", { name: "retry" }).click();
  await expect(rows(page)).toHaveCount(3);
  await expect(loadError(page)).toHaveCount(0);
});

test("export Python で、Topic で絞っていても Subject の問題を python.json に保存する", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await choose(page, "topic", "Decorators");
  await expect(rows(page)).toHaveCount(3);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "export Python" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("python.json");
  // 中身の項目と並びは export.test.ts で確かめる。ここでは Subject の全部が入っていることだけを見る
  expect((await readJson(file)).questions).toHaveLength(10);
});

test("manage-export-error：書き出せなかったら、絞り込みの下に帯を出す", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await page.route("/manage", (route) =>
    isServerAction(route.request()) ? route.abort() : route.continue(),
  );
  await page.getByRole("button", { name: "export Python" }).click();
  await expect(loadError(page)).toHaveText(/Couldn't export Python\./);
  await expect(rows(page)).toHaveCount(10);
  await expect(page).toHaveScreenshot("manage-export-error.png", {
    fullPage: true,
  });
});

function dialog(page: Page) {
  return page.getByRole("dialog");
}

test("manage-delete-subject：cancel と Esc ではそのまま、delete で消えて次の Subject になる", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await page.getByRole("button", { name: "delete subject" }).click();
  await expect(dialog(page)).toContainText(
    "5 topics, 10 questions and their records will be deleted.",
  );
  await expect(page).toHaveScreenshot("manage-delete-subject.png", {
    fullPage: true,
  });

  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await page.getByRole("button", { name: "delete subject" }).click();
  await dialog(page).getByRole("button", { name: "cancel" }).click();
  await expect(dialog(page)).toBeHidden();
  await expect(rows(page)).toHaveCount(10);

  await page.getByRole("button", { name: "delete subject" }).click();
  await dialog(page).getByRole("button", { name: "delete" }).click();
  await expect(dropdown(page, "subject")).toHaveText(/AWS SAA/);
  await expect(page.getByText("1–50 of 240")).toBeVisible();
  await dropdown(page, "subject").click();
  await expect(page.getByRole("option")).toHaveCount(3);
});

test("最後の Subject を消すと前の Subject、Subject が1つもなくなると0件の表示", async ({
  page,
}) => {
  await resetQuestions([
    { name: "Python", questions: many("py", 1) },
    { name: "Linux", questions: many("linux", 1) },
  ]);
  await openManage(page);
  await choose(page, "subject", "Linux");
  await page.getByRole("button", { name: "delete subject" }).click();
  await expect(dialog(page)).toContainText(
    "1 topic, 1 question and its records will be deleted.",
  );
  await dialog(page).getByRole("button", { name: "delete" }).click();
  await expect(dropdown(page, "subject")).toHaveText(/Python/);

  // 最後の1問を消すと、Subject も消える
  await rows(page).first().getByRole("button", { name: "delete" }).click();
  await dialog(page).getByRole("button", { name: "delete" }).click();
  await expect(page.getByText("No subjects yet.")).toBeVisible();
});

test("manage-delete-topic：All topics では Topic の delete を出さず、Topic を消すと All topics になる", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await expect(page.getByRole("button", { name: "delete topic" })).toHaveCount(
    0,
  );
  await choose(page, "topic", "Typing");
  await expect(rows(page)).toHaveCount(1);
  await page.getByRole("button", { name: "delete topic" }).click();
  await expect(dialog(page)).toContainText(
    "1 question and its records will be deleted.",
  );
  await page.keyboard.press("Escape");

  await choose(page, "topic", "Decorators");
  await expect(rows(page)).toHaveCount(3);
  await page.getByRole("button", { name: "delete topic" }).click();
  await expect(dialog(page)).toContainText(
    "3 questions and their records will be deleted.",
  );
  await expect(page).toHaveScreenshot("manage-delete-topic.png", {
    fullPage: true,
  });
  await dialog(page).getByRole("button", { name: "delete" }).click();
  await expect(dropdown(page, "topic")).toHaveText(/All topics/);
  await expect(rows(page)).toHaveCount(7);
});

test("manage-delete-question：1問を消す", async ({ page }) => {
  await resetPython();
  await openManage(page);
  await rows(page).first().getByRole("button", { name: "delete" }).click();
  await expect(dialog(page)).toContainText(
    "次のコードを実行したとき、出力されるものはどれか。",
  );
  await expect(page).toHaveScreenshot("manage-delete-question.png", {
    fullPage: true,
  });
  await dialog(page).getByRole("button", { name: "delete" }).click();
  await expect(rows(page)).toHaveCount(9);
  await expect(page.getByText("k3f9a2")).toHaveCount(0);
});

test("1問を消して今のページが空になったら、前のページを出す", async ({
  page,
}) => {
  await resetQuestions([{ name: "Python", questions: many("py", 51) }]);
  await openManage(page);
  await page.getByRole("button", { name: "page 2" }).click();
  await expect(page.getByText("51–51 of 51")).toBeVisible();
  await rows(page).first().getByRole("button", { name: "delete" }).click();
  await dialog(page).getByRole("button", { name: "delete" }).click();
  await expect(page.getByText("1–50 of 50")).toBeVisible();
});

test("消している間は cancel と delete を押せず、Esc でも閉じない", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  // 返事を返さずに止める
  await page.route("/manage", async (route) => {
    if (!isServerAction(route.request())) await route.continue();
  });
  await rows(page).first().getByRole("button", { name: "delete" }).click();
  await dialog(page).getByRole("button", { name: "delete" }).click();
  await expect(
    dialog(page).getByRole("button", { name: "delete" }),
  ).toBeDisabled();
  await expect(
    dialog(page).getByRole("button", { name: "cancel" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();
});

test("manage-delete-error：消せなかったら、ダイアログの中に帯を出し、何も消さない", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await choose(page, "topic", "Decorators");
  await expect(rows(page)).toHaveCount(3);
  await page.route("/manage", (route) =>
    isServerAction(route.request()) ? route.abort() : route.continue(),
  );
  await page.getByRole("button", { name: "delete topic" }).click();
  await dialog(page).getByRole("button", { name: "delete" }).click();
  await expect(dialog(page).getByRole("alert")).toHaveText("Couldn't delete.");
  await expect(page).toHaveScreenshot("manage-delete-error.png", {
    fullPage: true,
  });

  // 閉じて開き直すと、帯は消えている
  await dialog(page).getByRole("button", { name: "cancel" }).click();
  await page.getByRole("button", { name: "delete topic" }).click();
  await expect(dialog(page).getByRole("alert")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(rows(page)).toHaveCount(3);
});

test("manage-flagged：flagged で印の付いた問題だけになり、Topic を変えても読み込み直しても残り、Subject を変えると外れる", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await flaggedButton(page).click();
  await expect(rows(page)).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "export flagged · Python" }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("manage-flagged.png", { fullPage: true });

  await choose(page, "topic", "Decorators");
  await expect(rows(page)).toHaveCount(1);
  await page.reload();
  await expect(rows(page)).toHaveCount(1);

  await flaggedButton(page).click();
  await expect(rows(page)).toHaveCount(3);
  await expect(
    page.getByRole("button", { name: "export Python" }),
  ).toBeVisible();

  await flaggedButton(page).click();
  await expect(rows(page)).toHaveCount(1);
  await choose(page, "subject", "AWS SAA");
  await expect(page.getByText("1–50 of 240")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "export AWS SAA" }),
  ).toBeVisible();
});

test("flagged を押すと1ページ目に戻り、unflag で今のページが空になったら前のページを出す", async ({
  page,
}) => {
  await resetQuestions([
    {
      name: "Python",
      questions: many("py", 51).map((q) => ({ ...q, flagged: true })),
    },
  ]);
  await openManage(page);
  await page.getByRole("button", { name: "page 2" }).click();
  await expect(page.getByText("51–51 of 51")).toBeVisible();
  await flaggedButton(page).click();
  await expect(page.getByText("1–50 of 51")).toBeVisible();

  await page.getByRole("button", { name: "page 2" }).click();
  await expect(page.getByText("51–51 of 51")).toBeVisible();
  await rows(page).first().getByRole("button", { name: "unflag" }).click();
  await expect(page.getByText("1–50 of 50")).toBeVisible();
});

test("export flagged で、Topic で絞っていても Subject の印の付いた問題を python.json に保存する", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await flaggedButton(page).click();
  await choose(page, "topic", "Decorators");
  await expect(rows(page)).toHaveCount(1);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "export flagged · Python" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("python.json");
  expect((await readJson(file)).questions).toHaveLength(2);
});

test("manage-flagged-empty：Subject に印がなければ、0件の表示で export を出さない", async ({
  page,
}) => {
  await resetPython([], []);
  await openManage(page);
  await flaggedButton(page).click();
  await expect(page.getByText("No flagged questions in Python.")).toBeVisible();
  await expect(page.getByRole("button", { name: /^export/ })).toHaveCount(0);
  await expect(page).toHaveScreenshot("manage-flagged-empty.png", {
    fullPage: true,
  });
});

test("flagged を Topic で絞って0件なら Topic の名前を出し、Subject のほかの Topic に印があれば export flagged を出す", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await flaggedButton(page).click();
  await expect(rows(page)).toHaveCount(2);
  await choose(page, "topic", "Typing");
  await expect(page.getByText("No flagged questions in Typing.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "export flagged · Python" }),
  ).toBeVisible();
});

test("ふつうの一覧で unflag すると、行は残り unflag が消える", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await unflag(page, "p81xq0").click();
  await expect(unflag(page, "p81xq0")).toHaveCount(0);
  await expect(unflag(page, "c0y8u3")).toHaveCount(1);
  await expect(rows(page)).toHaveCount(10);
});

test("flagged の一覧で unflag すると行が消え、全部外すと0件の表示になる", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await flaggedButton(page).click();
  await expect(rows(page)).toHaveCount(2);
  await unflag(page, "p81xq0").click();
  await expect(rows(page)).toHaveCount(1);
  await unflag(page, "c0y8u3").click();
  await expect(page.getByText("No flagged questions in Python.")).toBeVisible();
  await expect(page.getByRole("button", { name: /^export/ })).toHaveCount(0);
});

test("unflag できなかったら帯を出して印を残し、選び方を変えたときと、もう一度外せたときに消す", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  async function failUnflag() {
    await page.route("/manage", (route) =>
      isServerAction(route.request()) ? route.abort() : route.continue(),
    );
    await unflag(page, "p81xq0").click();
    await expect(loadError(page)).toHaveText(/Couldn't unflag p81xq0\./);
    await expect(unflag(page, "p81xq0")).toHaveCount(1);
    await page.unrouteAll();
  }

  await failUnflag();
  await choose(page, "topic", "Decorators");
  await expect(rows(page)).toHaveCount(3);
  await expect(loadError(page)).toHaveCount(0);

  await failUnflag();
  await unflag(page, "p81xq0").click();
  await expect(unflag(page, "p81xq0")).toHaveCount(0);
  await expect(loadError(page)).toHaveCount(0);
});

test("flagged の一覧で Topic を消すと、確認に Topic の全部の問題の数を出し、All topics の flagged のまま", async ({
  page,
}) => {
  await resetPython();
  await openManage(page);
  await flaggedButton(page).click();
  await choose(page, "topic", "Decorators");
  await expect(rows(page)).toHaveCount(1);
  await page.getByRole("button", { name: "delete topic" }).click();
  await expect(dialog(page)).toContainText(
    "3 questions and their records will be deleted.",
  );
  await dialog(page).getByRole("button", { name: "delete" }).click();
  await expect(dropdown(page, "topic")).toHaveText(/All topics/);
  await expect(rows(page)).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "export flagged · Python" }),
  ).toBeVisible();
});
