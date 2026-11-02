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

test("setup-default", async ({ page }) => {
  await openSetup(page, python);
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

// 読み込みを流し込む途中で見つからないとわかるので、HTTP の状態ではなく、出した中身で確かめる
test("ない Subject の Setup は、見つからない画面を出す", async ({ page }) => {
  await resetQuestions();
  await page.goto("/subjects/999999");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("数字でない id の Setup も、見つからない画面を出す", async ({ page }) => {
  await page.goto("/subjects/abc");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

// サーバーアクションの通信（next-action の付いた POST）だけを選ぶ
function isServerAction(request: { method(): string; headers(): object }) {
  return request.method() === "POST" && "next-action" in request.headers();
}

const fence = "```";

// 解く画面の問題（Decorators 10問。in order で、この順に出る）。
// 4問目はコードのある単一選択、5問目は複数選択、6問目は選択肢がコード
const decorators: TestQuestion[] = [
  testQuestion("a1", {
    topic: "Decorators",
    choices: ["add", "wrapper"],
    correct: ["A"],
  }),
  testQuestion("a2", {
    topic: "Decorators",
    choices: ["add", "wrapper"],
    correct: ["A"],
  }),
  testQuestion("a3", {
    topic: "Decorators",
    choices: ["add", "wrapper"],
    correct: ["A"],
  }),
  testQuestion("k3f9a2", {
    topic: "Decorators",
    text: [
      "次のコードを実行したとき、出力されるものはどれか。",
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
      "print(add.__name__)",
      fence,
    ].join("\n"),
    choices: ["add", "wrapper", "logger", "None"],
    correct: ["B"],
    explanation: [
      '`@logger` を付けると、`add` は `logger` が返した `wrapper` に置き換わる。そのため `add.__name__` は `"wrapper"` になる。元の名前を残したいときは、`functools.wraps` を使う：',
      `${fence}python`,
      "from functools import wraps",
      "",
      "def logger(func):",
      "    @wraps(func)",
      "    def wrapper(*args, **kwargs):",
      "        # ...",
      fence,
    ].join("\n"),
  }),
  testQuestion("p81xq0", {
    topic: "Decorators",
    type: "multiple",
    text: "`functools.wraps` について、正しいものをすべて選べ。",
    choices: [
      "元の関数の `__name__` と `__doc__` を、ラッパーにコピーする。",
      "ラッパーの `__wrapped__` に、元の関数を入れる。",
      "ラッパーの実行が速くなる。",
      "いちばん外側のデコレータにしなければならない。",
    ],
    correct: ["A", "B"],
  }),
  testQuestion("m2v7c4", {
    topic: "Decorators",
    text: 'デコレータを付けたあとも `add.__name__` が `"add"` のままになる `logger` はどれか。',
    choices: [
      [
        fence,
        "def logger(func):",
        "    def wrapper(*args, **kwargs):",
        "        return func(*args, **kwargs)",
        "    return wrapper",
        fence,
      ].join("\n"),
      [
        fence,
        "from functools import wraps",
        "",
        "def logger(func):",
        "    @wraps(func)",
        "    def wrapper(*args, **kwargs):",
        "        return func(*args, **kwargs)",
        "    return wrapper",
        fence,
      ].join("\n"),
      [
        fence,
        "def logger(func):",
        "    wrapper = lambda *a, **k: func(*a, **k)",
        "    return wrapper",
        fence,
      ].join("\n"),
      [
        "ラッパーの名前を手で付け直す：",
        fence,
        "def logger(func):",
        "    def wrapper(*args, **kwargs):",
        "        return func(*args, **kwargs)",
        "    wrapper.__name__ = func.__name__",
        "    return wrapper",
        fence,
      ].join("\n"),
    ],
    correct: ["B"],
  }),
  testQuestion("a7", {
    topic: "Decorators",
    choices: ["add", "wrapper"],
    correct: ["A"],
  }),
  testQuestion("a8", {
    topic: "Decorators",
    choices: ["add", "wrapper"],
    correct: ["A"],
  }),
  testQuestion("a9", {
    topic: "Decorators",
    choices: ["add", "wrapper"],
    correct: ["A"],
  }),
  testQuestion("k3f9a2-last", {
    topic: "Decorators",
    text: "最後の問題。",
    choices: ["add", "wrapper", "logger", "None"],
    correct: ["B"],
  }),
];

// Decorators・in order・10 を選んで start し、1問目が出るのを待つ
async function startDecorators(page: Page, questions = decorators) {
  await openSetup(page, questions);
  await page.getByRole("radio", { name: "Decorators" }).click();
  await start(page).click();
  await expect(page.getByText("1/10", { exact: true })).toBeVisible();
}

function choice(page: Page, letter: string) {
  return page.getByRole("button", { name: new RegExp(`^${letter}\\b`) });
}

function button(page: Page, name: string) {
  return page.getByRole("button", { name, exact: true });
}

async function answer(page: Page, ...letters: string[]) {
  for (const letter of letters) await choice(page, letter).click();
  await button(page, "submit").click();
  await expect(button(page, "explanation")).toBeVisible();
}

async function next(page: Page) {
  await page.getByRole("button", { name: /^next/ }).click();
}

test("選んでいない間は submit を押せず、案内を出す。単一選択は選び直すと前の選択が外れる", async ({
  page,
}) => {
  await startDecorators(page);
  await expect(page.getByText("select an option to proceed")).toBeVisible();
  await expect(button(page, "submit")).toBeDisabled();

  await choice(page, "A").click();
  await choice(page, "B").click();
  await expect(choice(page, "A")).toHaveAttribute("aria-pressed", "false");
  await expect(choice(page, "B")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("select an option to proceed")).toBeHidden();
  await expect(button(page, "submit")).toBeEnabled();
});

test("答えるたびに数と番号が進み、正解・不正解の帯と、解説への切り替えが出る", async ({
  page,
}) => {
  await startDecorators(page);
  await answer(page, "A");
  await expect(page.getByText("correct", { exact: true })).toBeVisible();
  await next(page);
  await answer(page, "A");
  await next(page);
  await answer(page, "B");
  await expect(page.getByText("incorrect — answer: A")).toBeVisible();
  await next(page);

  await expect(page.getByText("4/10", { exact: true })).toBeVisible();
  await expect(page.getByLabel("correct answers")).toHaveText("2");
  await expect(page.getByLabel("wrong answers")).toHaveText("1");
  await choice(page, "B").click();
  await expect(page).toHaveScreenshot("solve-question.png", { fullPage: true });

  // 単一選択で選び直してから答える
  await choice(page, "A").click();
  await button(page, "submit").click();
  await expect(page.getByText("incorrect — answer: B")).toBeVisible();
  await expect(page.getByText("missed")).toBeVisible();
  await expect(page).toHaveScreenshot("solve-answered.png", { fullPage: true });

  await button(page, "explanation").click();
  await expect(page.getByText("explanation", { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot("solve-explanation.png", {
    fullPage: true,
  });
  await button(page, "question").click();
  await expect(page.getByText("incorrect — answer: B")).toBeVisible();
  await next(page);

  // 複数選択は、当てはまるものをいくつでも選ぶ。部分点はない
  await expect(page.getByText("select all that apply")).toBeVisible();
  await choice(page, "A").click();
  await choice(page, "C").click();
  await expect(choice(page, "A")).toHaveAttribute("aria-pressed", "true");
  await expect(choice(page, "C")).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveScreenshot("solve-multiple.png", { fullPage: true });
  await button(page, "submit").click();
  await expect(page.getByText("incorrect — answer: A, B")).toBeVisible();
  await expect(page).toHaveScreenshot("solve-answered-multiple.png", {
    fullPage: true,
  });
  await next(page);

  await choice(page, "B").click();
  await expect(page).toHaveScreenshot("solve-code-choices.png", {
    fullPage: true,
  });
  await choice(page, "D").click();
  await button(page, "submit").click();
  await expect(page.getByText("incorrect — answer: B")).toBeVisible();
  await expect(page).toHaveScreenshot("solve-answered-code-choices.png", {
    fullPage: true,
  });
});

test("skip で次に進み、不正解として数える。最後の問題は results で Setup に戻り、選び方が残る", async ({
  page,
}) => {
  await startDecorators(page);
  for (let i = 1; i <= 9; i++) {
    await button(page, "skip").click();
    await expect(page.getByText(`${i + 1}/10`, { exact: true })).toBeVisible();
  }
  await expect(page.getByLabel("wrong answers")).toHaveText("9");
  await answer(page, "B");
  await expect(page.getByRole("button", { name: /^next/ })).toHaveCount(0);
  await expect(page).toHaveScreenshot("solve-last.png", { fullPage: true });

  await page.getByRole("button", { name: /^results/ }).click();
  await expect(page.getByRole("radio", { name: "Decorators" })).toBeChecked();
  await expect(start(page)).toHaveText("start · 10");
});

test("最後の問題の skip は、Setup に戻る", async ({ page }) => {
  await startDecorators(page);
  for (let i = 1; i <= 10; i++) await button(page, "skip").click();
  await expect(page.getByRole("radio", { name: "Decorators" })).toBeChecked();
});

test("solve-many：問題が多いと、37/100 のように出す", async ({ page }) => {
  await openSetup(
    page,
    Array.from({ length: 100 }, (_, i) =>
      i === 36 ? { ...decorators[3], id: "many37" } : testQuestion(`n${i + 1}`),
    ),
  );
  await page.getByRole("radio", { name: "all", exact: true }).click();
  await start(page).click();
  for (let i = 1; i <= 36; i++) {
    await button(page, "skip").click();
    await expect(page.getByText(`${i + 1}/100`, { exact: true })).toBeVisible();
  }
  await choice(page, "B").click();
  await expect(page).toHaveScreenshot("solve-many.png", { fullPage: true });
});

test("solve-loading：問題を受け取るまで、点滅する枠を出す", async ({
  page,
}) => {
  await openSetup(page, decorators);
  // 返事を返さずに止めて、読み込み中の画面を撮る
  await page.route(/\/subjects\/\d+$/, async (route) => {
    if (!isServerAction(route.request())) await route.continue();
  });
  await start(page).click();
  await expect(page.getByTestId("solve-loading")).toBeVisible();
  await expect(page).toHaveScreenshot("solve-loading.png", { fullPage: true });
});

test("問題を読めなかったら、Setup のまま帯と retry を出し、retry で始められる", async ({
  page,
}) => {
  await openSetup(page, decorators);
  await page.route(/\/subjects\/\d+$/, (route) =>
    isServerAction(route.request()) ? route.abort() : route.continue(),
  );
  await start(page).click();
  await expect(page.getByRole("alert")).toHaveText(/Couldn't load questions\./);

  await page.unrouteAll();
  await page.getByRole("button", { name: "retry" }).click();
  await expect(page.getByText("1/10", { exact: true })).toBeVisible();
});
