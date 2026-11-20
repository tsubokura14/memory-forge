import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import {
  countAnswers,
  insertAnswers,
  resetQuestions,
  type TestQuestion,
  testQuestion,
} from "./questions";
import { SIGNED_IN_STATE } from "./test-user";

test.use({ storageState: SIGNED_IN_STATE });

// topic の問題を n 問作る。ID は topic の頭文字と番号
function topicQuestions(topic: string, n: number): TestQuestion[] {
  return Array.from({ length: n }, (_, i) =>
    testQuestion(`${topic.slice(0, 3).toLowerCase()}${i + 1}`, { topic }),
  );
}

// 使う場面の Python（Basics 12問・Decorators 10問・Generators 9問・Typing 8問・Async 9問）
const python = [
  ...topicQuestions("Basics", 12),
  ...topicQuestions("Decorators", 10),
  ...topicQuestions("Generators", 9),
  ...topicQuestions("Typing", 8),
  ...topicQuestions("Async", 9),
];

// id の頭から順に答えを入れる記録。correct 問を正解、続く wrong 問を不正解にする
function answersFor(prefix: string, correct: number, wrong: number) {
  return Array.from({ length: correct + wrong }, (_, i) => ({
    questionId: `${prefix}${i + 1}`,
    correct: i < correct,
  }));
}

// Python の答えた記録。Decorators は印を付ける dec1 も答えておき、印の付いた問題を数えないことが画像でわかるようにする
// （dec1 に印を付けると、Basics 10・2・0、Decorators 5・3・1、Generators 5・2・2、Typing 0・0・8、Async 6・1・2）
const pythonAnswers = [
  ...answersFor("bas", 10, 2),
  { questionId: "dec1", correct: true },
  ...answersFor("dec", 6, 3).slice(1),
  ...answersFor("gen", 5, 2),
  ...answersFor("asy", 6, 1),
];

// Subject を入れ直し、答えた記録を入れ、その Setup を開いて、読み終えるのを待つ
async function openSetup(
  page: Page,
  questions: TestQuestion[],
  records: { questionId: string; correct: boolean }[] = [],
) {
  const [id] = await resetQuestions([{ name: "Python", questions }]);
  if (records.length > 0) await insertAnswers(records);
  await page.goto(`/subjects/${id}`);
  await expect(page.getByTestId("setup-loading")).toHaveCount(0);
}

function start(page: Page) {
  return page.getByRole("button", { name: /解きはじめる$/ });
}

test("setup-default：印の付いた問題があると、除いたことを start の上に出す。スマホの幅では数が折り返す", async ({
  page,
}) => {
  await openSetup(
    page,
    python.map((q) => (q.id === "dec1" ? { ...q, flagged: true } : q)),
    pythonAnswers,
  );
  await expect(
    page.getByText("問は不備の印があるので出しません"),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("setup-default.png", { fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page).toHaveScreenshot("setup-default-mobile.png", {
    fullPage: true,
  });
});

test("setup-none：Topic の問題が全部印付きだと、理由を出し、start を押せない", async ({
  page,
}) => {
  await openSetup(
    page,
    python.map((q) =>
      q.topic === "Typing" || q.id === "dec1" ? { ...q, flagged: true } : q,
    ),
    pythonAnswers,
  );
  await page.getByRole("radio", { name: "Typing" }).click();
  await expect(
    page.getByText(
      "Typing の 8 問すべてに不備の印があるので、出せる問題がありません。",
    ),
  ).toBeVisible();
  await expect(page.getByText("問は不備の印があるので出しません")).toHaveCount(
    0,
  );
  await expect(start(page)).toHaveText("解きはじめる");
  await expect(start(page)).toBeDisabled();
  await expect(page).toHaveScreenshot("setup-none.png", { fullPage: true });
});

test("setup-few：Topic の問題が足りないと、Topic の名前で案内し、ある分の数を添える", async ({
  page,
}) => {
  await openSetup(page, python, pythonAnswers);
  await page.getByRole("radio", { name: "Typing" }).click();
  await expect(
    page.getByText("Typing で出せるのは 8 問だけです。"),
  ).toBeVisible();
  await expect(start(page)).toHaveText("8問を解きはじめる");
  await expect(page).toHaveScreenshot("setup-few.png", { fullPage: true });
});

test("All で問題が足りないと、Subject の名前で案内する", async ({ page }) => {
  await openSetup(page, topicQuestions("Basics", 3));
  await expect(
    page.getByText("Python で出せるのは 3 問だけです。"),
  ).toBeVisible();
  await expect(start(page)).toHaveText("3問を解きはじめる");
});

test("setup-unanswered：lowest accuracy で解いた問題がないと、理由を出し、start を押せない", async ({
  page,
}) => {
  await openSetup(page, python, pythonAnswers);
  await page.getByRole("radio", { name: "Typing" }).click();
  await page.getByRole("radio", { name: "苦手な順" }).click();
  await expect(
    page.getByText(
      "Typing にはまだ解いた問題がないので、苦手な順では出せません。",
    ),
  ).toBeVisible();
  await expect(start(page)).toHaveText("解きはじめる");
  await expect(start(page)).toBeDisabled();
  await expect(page).toHaveScreenshot("setup-unanswered.png", {
    fullPage: true,
  });
});

// setup-many の Topic ごとの [correct, wrong, new]。30の Topic でくり返す
const MANY_COUNTS = [
  [1, 1, 3],
  [3, 3, 6],
  [3, 1, 2],
  [3, 0, 4],
  [0, 0, 8],
  [4, 1, 4],
];

test("setup-many：Topic が多いと、行が続く", async ({ page }) => {
  const questions: TestQuestion[] = [];
  const records: { questionId: string; correct: boolean }[] = [];
  for (let t = 1; t <= 30; t++) {
    const [correct, wrong, fresh] = MANY_COUNTS[(t - 1) % MANY_COUNTS.length];
    for (let i = 1; i <= correct + wrong + fresh; i++) {
      const id = `m${t}-${i}`;
      questions.push(
        testQuestion(id, { topic: `Topic ${String(t).padStart(2, "0")}` }),
      );
      if (i <= correct + wrong)
        records.push({ questionId: id, correct: i <= correct });
    }
  }
  await openSetup(page, questions, records);
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
        `${fence}python`,
        "def logger(func):",
        "    def wrapper(*args, **kwargs):",
        "        return func(*args, **kwargs)",
        "    return wrapper",
        fence,
      ].join("\n"),
      [
        `${fence}python`,
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
        `${fence}python`,
        "def logger(func):",
        "    wrapper = lambda *a, **k: func(*a, **k)",
        "    return wrapper",
        fence,
      ].join("\n"),
      [
        "ラッパーの名前を手で付け直す：",
        `${fence}python`,
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
  await expect(page.getByText("1 / 10", { exact: true })).toBeVisible();
}

function choice(page: Page, letter: string) {
  return page.getByRole("button", { name: new RegExp(`^${letter}\\b`) });
}

function button(page: Page, name: string) {
  return page.getByRole("button", { name, exact: true });
}

async function answer(page: Page, ...letters: string[]) {
  for (const letter of letters) await choice(page, letter).click();
  await button(page, "答え合わせする").click();
  await expect(button(page, "解説を見る")).toBeVisible();
}

async function next(page: Page) {
  await page.getByRole("button", { name: /^次の問題へ/ }).click();
}

test("選んでいない間は答え合わせを押せず、案内を出す。単一選択は選び直すと前の選択が外れる", async ({
  page,
}) => {
  await startDecorators(page);
  await expect(
    page.getByText("選択肢を選ぶと答え合わせできます"),
  ).toBeVisible();
  await expect(button(page, "答え合わせする")).toBeDisabled();

  await choice(page, "A").click();
  await choice(page, "B").click();
  await expect(choice(page, "A")).toHaveAttribute("aria-pressed", "false");
  await expect(choice(page, "B")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("選択肢を選ぶと答え合わせできます")).toBeHidden();
  await expect(button(page, "答え合わせする")).toBeEnabled();
});

test("答えるたびに数と番号が進み、正解・不正解の帯と、解説への切り替えが出る。選んだ答えと正解は読み上げの名前で伝える", async ({
  page,
}) => {
  await startDecorators(page);
  await answer(page, "A");
  await expect(page.getByText("正解", { exact: true })).toBeVisible();
  await next(page);
  await answer(page, "A");
  await next(page);
  await answer(page, "B");
  await expect(page.getByText("不正解。答えは A")).toBeVisible();
  await next(page);

  await expect(page.getByText("4 / 10", { exact: true })).toBeVisible();
  await expect(page.getByLabel("正解の数", { exact: true })).toHaveText("2");
  await expect(page.getByLabel("不正解の数", { exact: true })).toHaveText("1");
  await choice(page, "B").click();
  await expect(page).toHaveScreenshot("solve-question.png", { fullPage: true });

  // 単一選択で選び直してから答える
  await choice(page, "A").click();
  await button(page, "答え合わせする").click();
  await expect(page.getByText("不正解。答えは B")).toBeVisible();
  // 答えたあとの状態は、右端に文字を出さず、読み上げの名前で伝える
  await expect(page.getByText("missed")).toHaveCount(0);
  await expect(choice(page, "A")).toHaveAccessibleName(/選んだ答え・不正解$/);
  await expect(choice(page, "B")).toHaveAccessibleName(/ 正解$/);
  await expect(page).toHaveScreenshot("solve-answered.png", { fullPage: true });

  await button(page, "解説を見る").click();
  await expect(page.getByText("解説", { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot("solve-explanation.png", {
    fullPage: true,
  });
  await button(page, "問題に戻る").click();
  await expect(page.getByText("不正解。答えは B")).toBeVisible();
  await next(page);

  // 複数選択は、当てはまるものをいくつでも選ぶ。部分点はない
  await expect(
    page.getByText("当てはまるものをすべて選んでください"),
  ).toBeVisible();
  await choice(page, "A").click();
  await choice(page, "C").click();
  await expect(choice(page, "A")).toHaveAttribute("aria-pressed", "true");
  await expect(choice(page, "C")).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveScreenshot("solve-multiple.png", { fullPage: true });
  await button(page, "答え合わせする").click();
  await expect(page.getByText("不正解。答えは A, B")).toBeVisible();
  await expect(choice(page, "A")).toHaveAccessibleName(/選んだ答え・正解$/);
  await expect(choice(page, "B")).toHaveAccessibleName(/ 正解$/);
  await expect(choice(page, "C")).toHaveAccessibleName(/選んだ答え・不正解$/);
  await expect(choice(page, "D")).toHaveAccessibleName(/ならない。$/);
  await expect(page).toHaveScreenshot("solve-answered-multiple.png", {
    fullPage: true,
  });
  await next(page);

  await choice(page, "B").click();
  await expect(page).toHaveScreenshot("solve-code-choices.png", {
    fullPage: true,
  });
  await choice(page, "D").click();
  await button(page, "答え合わせする").click();
  await expect(page.getByText("不正解。答えは B")).toBeVisible();
  await expect(page).toHaveScreenshot("solve-answered-code-choices.png", {
    fullPage: true,
  });
});

test("飛ばすと次に進み、不正解として数える。最後の問題は「結果を見る」で Result に移り、「もう一度解く」で選び方の残った Setup に戻り、答えた分が具合に入る", async ({
  page,
}) => {
  await startDecorators(page);
  for (let i = 1; i <= 9; i++) {
    await button(page, "飛ばす").click();
    await expect(
      page.getByText(`${i + 1} / 10`, { exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByLabel("不正解の数", { exact: true })).toHaveText("9");
  await answer(page, "B");
  await expect(page.getByRole("button", { name: /^次の問題へ/ })).toHaveCount(
    0,
  );
  await expect(page).toHaveScreenshot("solve-last.png", { fullPage: true });

  await page.getByRole("button", { name: /^結果を見る/ }).click();
  await expect(page.getByText("解き終わりました")).toBeVisible();
  await button(page, "もう一度解く").click();
  await expect(page.getByRole("radio", { name: "Decorators" })).toBeChecked();
  await expect(start(page)).toHaveText("10問を解きはじめる");
  await expect(page.getByRole("radio", { name: "Decorators" })).toContainText(
    "正解 1 · 不正解 9 · まだ 0",
  );
});

test("最後の問題で飛ばしても、Result に移る", async ({ page }) => {
  await startDecorators(page);
  for (let i = 1; i <= 10; i++) await button(page, "飛ばす").click();
  await expect(page.getByText("解き終わりました")).toBeVisible();
});

test("result-default：解き終わりの結果。得点を大きく出し、正答率と数、Topic ごとの正解の数を出す", async ({
  page,
}) => {
  // 正解はどれも C。d4 は前に正解した記録があり、今回間違えるので、線の黄色になる
  await openSetup(page, [
    ...topicQuestions("Decorators", 5),
    ...topicQuestions("Generators", 3),
    ...topicQuestions("Async", 2),
  ]);
  await insertAnswers([{ questionId: "dec4", correct: true }]);
  await start(page).click();
  await expect(page.getByText("1 / 10", { exact: true })).toBeVisible();
  // Decorators 3/4（dec5 は答える前に印を付ける）・Generators 2/3・Async 1/2（最後はスキップ）
  for (const letter of ["C", "C", "C", "A"]) {
    await answer(page, letter);
    await next(page);
  }
  await button(page, "不備の印").click();
  await expect(page.getByText("6 / 10", { exact: true })).toBeVisible();
  for (const letter of ["C", "C", "A", "C"]) {
    await answer(page, letter);
    await next(page);
  }
  await button(page, "飛ばす").click();

  await expect(page.getByText("解き終わりました")).toBeVisible();
  const main = page.getByRole("main");
  await expect(main).toContainText("6 / 9問 正解");
  await expect(main).toContainText("正答率 67%");
  await expect(main).toContainText("不正解 2");
  await expect(main).toContainText("飛ばした 1");
  await expect(main).toContainText("不備の印（数えない） 1");
  await expect(main).toContainText("Decorators3/4");
  await expect(page.getByRole("link", { name: "ホームへ戻る" })).toBeVisible();
  // 間違えた問題は、不正解と飛ばした問題を解いた順に並べ、印を付けた dec5 は入れない
  await expect(missedRows(page)).toHaveText([
    /Decorators$/,
    /Generators$/,
    /Async$/,
  ]);
  await expect(button(page, "間違えた問題を解き直す")).toBeVisible();
  await expect(button(page, "もう一度解く")).toHaveCount(0);
  await expect(page).toHaveScreenshot("result-default.png", { fullPage: true });
});

// Result の「間違えた問題」の行
function missedRows(page: Page) {
  return page.getByRole("list", { name: "間違えた問題" }).getByRole("button");
}

test("result-perfect：全部正解すると、間違えた問題の一覧を出さず、「もう一度解く」を出す", async ({
  page,
}) => {
  await openSetup(page, topicQuestions("Decorators", 3));
  await start(page).click();
  for (let i = 0; i < 3; i++) {
    await answer(page, "C");
    await page
      .getByRole("button", { name: /^(次の問題へ|結果を見る)/ })
      .click();
  }
  await expect(page.getByText("解き終わりました")).toBeVisible();
  await expect(page.getByText("間違えた問題", { exact: true })).toHaveCount(0);
  await expect(button(page, "もう一度解く")).toBeVisible();
  await expect(button(page, "間違えた問題を解き直す")).toHaveCount(0);
  await expect(page).toHaveScreenshot("result-perfect.png", { fullPage: true });
});

test("result-many：間違えた問題が多いと、一覧の行が続く", async ({ page }) => {
  await openSetup(page, [
    ...topicQuestions("Decorators", 10),
    ...topicQuestions("Generators", 10),
  ]);
  await page.getByRole("radio", { name: "すべて", exact: true }).click();
  await page.getByRole("radio", { name: "20", exact: true }).click();
  await start(page).click();
  for (let i = 1; i <= 20; i++) {
    await button(page, "飛ばす").click();
    if (i < 20)
      await expect(
        page.getByText(`${i + 1} / 20`, { exact: true }),
      ).toBeVisible();
  }
  await expect(missedRows(page)).toHaveCount(20);
  await expect(page).toHaveScreenshot("result-many.png", { fullPage: true });
});

// 4問目（k3f9a2）を A で間違え、5問目（p81xq0）を飛ばし、残りは正解して Result まで進める
async function toResultWithMissed(page: Page) {
  await startDecorators(page);
  for (const letters of [["A"], ["A"], ["A"], ["A"]]) {
    await answer(page, ...letters);
    await next(page);
  }
  await button(page, "飛ばす").click();
  for (const letters of [["B"], ["A"], ["A"], ["A"], ["B"]]) {
    await answer(page, ...letters);
    await page
      .getByRole("button", { name: /^(次の問題へ|結果を見る)/ })
      .click();
  }
  await expect(page.getByText("解き終わりました")).toBeVisible();
}

test("solve-review：間違えた問題の行を押すと、答えたあとの見た目で見直せ、記録は増えない。「結果に戻る」で Result に戻る", async ({
  page,
}) => {
  await toResultWithMissed(page);
  const before = await countAnswers();
  await missedRows(page).first().click();
  await expect(page.getByText("不正解。答えは B")).toBeVisible();
  await expect(choice(page, "A")).toHaveAccessibleName(/選んだ答え・不正解/);
  await expect(choice(page, "B")).toHaveAccessibleName(/正解/);
  await expect(button(page, "不備の印")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^次の問題へ/ })).toHaveCount(
    0,
  );
  await expect(page).toHaveScreenshot("solve-review.png", { fullPage: true });

  await button(page, "解説を見る").click();
  await expect(
    page.getByText("functools.wraps", { exact: false }).first(),
  ).toBeVisible();
  await button(page, "問題に戻る").click();
  await page.getByRole("button", { name: "結果に戻る" }).click();
  await expect(page.getByText("解き終わりました")).toBeVisible();
  await expect(missedRows(page)).toHaveCount(2);
  expect(await countAnswers()).toBe(before);
});

test("solve-review-skipped：飛ばした問題の見直しは、何も選んでいない選択肢に正解の色を付け、「飛ばしました。答えは A, B」を出す", async ({
  page,
}) => {
  await toResultWithMissed(page);
  await missedRows(page).nth(1).click();
  await expect(page.getByText("飛ばしました。答えは A, B")).toBeVisible();
  await expect(choice(page, "A")).toHaveAccessibleName(/正解/);
  await expect(choice(page, "C")).not.toHaveAccessibleName(/正解/);
  await expect(page).toHaveScreenshot("solve-review-skipped.png", {
    fullPage: true,
  });
});

test("solve-many：問題が多いと、37 / 100 のように出す", async ({ page }) => {
  // 36問をスキップして進むので、ふつうの上限（30秒）では足りない
  test.setTimeout(90_000);
  await openSetup(
    page,
    Array.from({ length: 100 }, (_, i) =>
      i === 36 ? { ...decorators[3], id: "many37" } : testQuestion(`n${i + 1}`),
    ),
  );
  await page.getByRole("radio", { name: "すべて", exact: true }).click();
  await start(page).click();
  for (let i = 1; i <= 36; i++) {
    await button(page, "飛ばす").click();
    await expect(
      page.getByText(`${i + 1} / 100`, { exact: true }),
    ).toBeVisible();
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
  await expect(page.getByRole("button", { name: "やめる" })).toBeDisabled();
  await expect(page).toHaveScreenshot("solve-loading.png", { fullPage: true });
});

// 3問を答えて（2問正解・1問不正解）、4問目で B を選んだところまで進める（solve-error と solve-quit の画像の状態）
async function toFourth(page: Page, questions = decorators) {
  await startDecorators(page, questions);
  await answer(page, "A");
  await next(page);
  await answer(page, "A");
  await next(page);
  await answer(page, "B");
  await next(page);
  await choice(page, "B").click();
}

test("solve-no-language：言語の名前のないコードは、色を付けずに行番号だけ付ける", async ({
  page,
}) => {
  const questions = decorators.map((q) =>
    q.id === "k3f9a2"
      ? { ...q, text: q.text.replace(`${fence}python`, fence) }
      : q,
  );
  await toFourth(page, questions);
  await expect(page).toHaveScreenshot("solve-no-language.png", {
    fullPage: true,
  });
});

function failActions(page: Page) {
  return page.route(/\/subjects\/\d+$/, (route) =>
    isServerAction(route.request()) ? route.abort() : route.continue(),
  );
}

function saveError(page: Page) {
  return page.getByRole("main").getByRole("alert");
}

test("solve-error：答えを保存できなかったら、数を進めずに帯と「もう一度保存する」を出し、押すと答え合わせする", async ({
  page,
}) => {
  await toFourth(page);
  await failActions(page);
  await button(page, "答え合わせする").click();
  await expect(saveError(page)).toHaveText(/答えを保存できませんでした。/);
  await expect(page.getByLabel("正解の数", { exact: true })).toHaveText("2");
  await expect(page.getByLabel("不正解の数", { exact: true })).toHaveText("1");
  await expect(choice(page, "B")).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveScreenshot("solve-error.png", { fullPage: true });

  await page.unrouteAll();
  await button(page, "もう一度保存する").click();
  await expect(page.getByText("正解", { exact: true })).toBeVisible();
  await expect(saveError(page)).toHaveCount(0);
  await expect(page.getByLabel("正解の数", { exact: true })).toHaveText("3");
});

test("飛ばすを保存できなかったら、同じ帯を出して進まず、「もう一度保存する」で次に進む", async ({
  page,
}) => {
  await startDecorators(page);
  await failActions(page);
  await button(page, "飛ばす").click();
  await expect(saveError(page)).toHaveText(/答えを保存できませんでした。/);
  await expect(page.getByText("1 / 10", { exact: true })).toBeVisible();

  await page.unrouteAll();
  await button(page, "もう一度保存する").click();
  await expect(page.getByText("2 / 10", { exact: true })).toBeVisible();
  await expect(page.getByLabel("不正解の数", { exact: true })).toHaveText("1");
  await expect(saveError(page)).toHaveCount(0);
});

test("solve-flagged：答える前に不備の印を付けると、記録せず、数を増やさずに次の問題に進み、知らせは次の操作で消える", async ({
  page,
}) => {
  await toFourth(page);
  await button(page, "不備の印").click();
  const notice = page.getByText(
    "k3f9a2 に不備の印を付けました。記録せずに次へ進みました。",
  );
  await expect(notice).toBeVisible();
  await expect(page.getByText("5 / 10", { exact: true })).toBeVisible();
  await expect(page.getByLabel("正解の数", { exact: true })).toHaveText("2");
  await expect(page.getByLabel("不正解の数", { exact: true })).toHaveText("1");
  expect(await countAnswers()).toBe(3);
  await expect(page).toHaveScreenshot("solve-flagged.png", { fullPage: true });

  await choice(page, "A").click();
  await expect(notice).toHaveCount(0);
});

test("result-all-flagged：全部の問題に印を付けると、最後は Result に移り、数える問題がない表示になる", async ({
  page,
}) => {
  await openSetup(page, topicQuestions("Decorators", 3));
  await start(page).click();
  for (const n of [2, 3]) {
    await button(page, "不備の印").click();
    await expect(page.getByText(`${n} / 3`, { exact: true })).toBeVisible();
  }
  await button(page, "不備の印").click();
  await expect(
    page.getByText("数える問題がありませんでした（すべてに不備の印）"),
  ).toBeVisible();
  await expect(page.getByRole("main")).toContainText("—");
  await expect(page.getByText("Topic ごと")).toHaveCount(0);
  await expect(page.getByText("間違えた問題", { exact: true })).toHaveCount(0);
  await expect(button(page, "もう一度解く")).toBeVisible();
  await expect(page).toHaveScreenshot("result-all-flagged.png", {
    fullPage: true,
  });
});

test("solve-answered-flagged：答えたあとに不備の印を付けると、その場で「印を付けた」に変わり、上の数は減らさない", async ({
  page,
}) => {
  await toFourth(page);
  await button(page, "答え合わせする").click();
  await button(page, "解説を見る").click();
  await button(page, "不備の印").click();
  await expect(button(page, "印を付けた")).toBeVisible();
  await expect(page.getByLabel("正解の数", { exact: true })).toHaveText("3");
  await expect(page).toHaveScreenshot("solve-answered-flagged.png", {
    fullPage: true,
  });
});

test("答えたあとに不備の印を付けた問題は、Result で不備の印に数え、得点に入れない", async ({
  page,
}) => {
  await openSetup(page, topicQuestions("Decorators", 1));
  await start(page).click();
  await answer(page, "C");
  await button(page, "不備の印").click();
  await expect(button(page, "印を付けた")).toBeVisible();
  await page.getByRole("button", { name: /^結果を見る/ }).click();
  await expect(
    page.getByText("数える問題がありませんでした（すべてに不備の印）"),
  ).toBeVisible();
});

test("答える前の不備の印を保存できなかったら、帯と「もう一度保存する」を出して進まず、押すと次に進む", async ({
  page,
}) => {
  await startDecorators(page);
  await failActions(page);
  await button(page, "不備の印").click();
  await expect(saveError(page)).toHaveText(/不備の印を付けられませんでした。/);
  await expect(page.getByText("1 / 10", { exact: true })).toBeVisible();

  await page.unrouteAll();
  await button(page, "もう一度保存する").click();
  await expect(page.getByText("2 / 10", { exact: true })).toBeVisible();
  await expect(saveError(page)).toHaveCount(0);
  await expect(
    page.getByText("に不備の印を付けました。記録せずに次へ進みました。"),
  ).toBeVisible();
});

test("解説を見ているときに不備の印を保存できなかったら、解説の下に帯を出し、次の問題に進むと消える", async ({
  page,
}) => {
  await startDecorators(page);
  await answer(page, "A");
  await button(page, "解説を見る").click();
  await failActions(page);
  await button(page, "不備の印").click();
  await expect(saveError(page)).toHaveText(/不備の印を付けられませんでした。/);
  await expect(button(page, "不備の印")).toBeVisible();

  await page.unrouteAll();
  await next(page);
  await expect(page.getByText("2 / 10", { exact: true })).toBeVisible();
  await expect(saveError(page)).toHaveCount(0);
});

test("solve-quit：やめるで確かめのダイアログを出す。「続ける」と Esc は続け、「やめる」は選び方を残して Setup に戻る", async ({
  page,
}) => {
  await toFourth(page);
  const dialog = page.getByRole("dialog");
  await page.getByRole("button", { name: "やめる" }).click();
  await expect(dialog).toContainText("途中でやめますか？");
  await expect(dialog).toContainText("ここまでの答えは残ります。");
  await expect(page).toHaveScreenshot("solve-quit.png", { fullPage: true });

  await dialog.getByRole("button", { name: "続ける" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("4 / 10", { exact: true })).toBeVisible();
  await expect(choice(page, "B")).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "やめる" }).click();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByText("4 / 10", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "やめる" }).click();
  await dialog.getByRole("button", { name: "やめる" }).click();
  await expect(page.getByRole("radio", { name: "Decorators" })).toBeChecked();
});

test("問題を読めなかったら、Setup のまま帯と retry を出し、retry で始められる", async ({
  page,
}) => {
  await openSetup(page, decorators);
  await page.route(/\/subjects\/\d+$/, (route) =>
    isServerAction(route.request()) ? route.abort() : route.continue(),
  );
  await start(page).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    /問題を読み込めませんでした。/,
  );

  await page.unrouteAll();
  await page.getByRole("button", { name: "もう一度読み込む" }).click();
  await expect(page.getByText("1 / 10", { exact: true })).toBeVisible();
});
