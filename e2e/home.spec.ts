import { expect, FIXED_NOW, test } from "./fixtures";
import {
  insertAnswers,
  resetQuestions,
  type TestQuestion,
  testQuestion,
} from "./questions";
import { signedInCookies } from "./session";
import { SIGNED_IN_STATE } from "./test-user";

// 最後の答えが正解・不正解の問題、まだ解いていない問題、印の付いた問題（正解の記録つき）を持つ Subject。
// insertAnswers はファイルの ID で問題を探すので、ID の頭に Subject ごとの prefix を付けて重ならないようにする
function subjectWith(
  name: string,
  prefix: string,
  counts: { correct: number; wrong: number; new: number; flagged?: number },
) {
  const questions: TestQuestion[] = [];
  const answers: { questionId: string; correct: boolean }[] = [];
  const add = (kind: string, n: number, answer?: boolean, flagged = false) => {
    for (let i = 0; i < n; i++) {
      const id = `${prefix}-${kind}${i}`;
      questions.push(testQuestion(id, { flagged }));
      if (answer !== undefined)
        answers.push({ questionId: id, correct: answer });
    }
  };
  add("c", counts.correct, true);
  add("w", counts.wrong, false);
  add("n", counts.new);
  add("f", counts.flagged ?? 0, true, true);
  return { subject: { name, questions }, answers };
}

// answeredAt を渡すと、身についている具合の答えをその日時にする（渡さなければ固定した今の日時）
async function resetWithAnswers(
  list: ReturnType<typeof subjectWith>[],
  answeredAt?: Date,
) {
  const ids = await resetQuestions(list.map((s) => s.subject));
  const answers = list.flatMap((s) =>
    s.answers.map((a) => ({ ...a, answeredAt })),
  );
  if (answers.length > 0) await insertAnswers(answers);
  return ids;
}

// 固定した今日（2026-01-15 木曜。e2e/fixtures.ts）から n 日前の、日本時間 9 時
function daysAgo(n: number): Date {
  const d = new Date(FIXED_NOW);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

// 連続日数のための答え。最後に正解した問題（s0-c0）に正解を足すので、身についている具合は変わらない
async function insertStreak(daysBack: number[]) {
  await insertAnswers(
    daysBack.map((n) => ({
      questionId: "s0-c0",
      correct: true,
      answeredAt: daysAgo(n),
    })),
  );
}

// 「続きから」を Python にする。Python の最後に正解した問題（s1-c0）に正解を足すので、身についている具合は変わらない。
// 同じ日時の答えは、あとに入れた答えを最近とする（getContinueSubject）
async function answerPythonLast(answeredAt?: Date) {
  await insertAnswers([{ questionId: "s1-c0", correct: true, answeredAt }]);
}

// home-default と同じ4つの Subject
function defaultSubjects() {
  return [
    subjectWith("AWS SAA", "s0", { correct: 150, wrong: 50, new: 40 }),
    subjectWith("Python", "s1", {
      correct: 30,
      wrong: 10,
      new: 8,
      flagged: 1,
    }),
    subjectWith("TypeScript", "s2", { correct: 61, wrong: 11, new: 0 }),
    subjectWith("Linux", "s3", { correct: 0, wrong: 0, new: 30 }),
  ];
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

test.describe("ログインした状態を保存したもので開く", () => {
  test.use({ storageState: SIGNED_IN_STATE });

  test("home-empty", async ({ page }) => {
    await resetQuestions();
    await page.goto("/");
    await expect(page.getByText("まだ科目がありません。")).toBeVisible();
    // Subject がないときは「続きから」を出さない
    await expect(page.getByText("続きから")).toHaveCount(0);
    await expect(page).toHaveScreenshot("home-empty.png", { fullPage: true });
  });

  test("home-default：続きからと Subject を並べ、押すと Setup に移る", async ({
    page,
  }) => {
    // Python の印の付いた問題は数えず、Home には印の数も出さない
    const list = defaultSubjects();
    const ids = await resetWithAnswers(list);
    // 今日を含めて12日続いている
    await insertStreak(range(1, 11));
    await answerPythonLast();
    await page.goto("/");
    const subjects = page.getByRole("list", { name: "科目" });
    // 並びは listSubjects の Vitest で確かめる。ここでは読み終えるのを待つ
    await expect(subjects.getByRole("link")).toHaveCount(list.length);
    const card = page.getByRole("region", { name: "続きから" });
    await expect(card.getByText("Python")).toBeVisible();
    // 最後に間違えた10問 + まだ解いていない8問（印の付いた問題は数えない）
    await expect(card.getByText("18問がまだ身についていません")).toBeVisible();
    await expect(card.getByText("12日連続", { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot("home-default.png", { fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page).toHaveScreenshot("home-default-mobile.png", {
      fullPage: true,
    });
    await page.setViewportSize({ width: 1280, height: 720 });

    await subjects.getByRole("link", { name: "Python" }).click();
    await expect(page).toHaveURL(`/subjects/${ids[1]}`);

    await page.goto("/");
    await card.getByRole("link", { name: "解きはじめる" }).click();
    await expect(page).toHaveURL(`/subjects/${ids[1]}`);

    await page.goto("/");
    await page.getByRole("link", { name: "問題の管理" }).click();
    await expect(page).toHaveURL("/manage");

    await page.goto("/");
    await page.getByRole("link", { name: "設定" }).click();
    await expect(page).toHaveURL("/settings");
  });

  test("home-streak-pending", async ({ page }) => {
    // 昨日まで12日続いていて、今日はまだ
    await resetWithAnswers(defaultSubjects(), daysAgo(1));
    await insertStreak(range(2, 12));
    await answerPythonLast(daysAgo(1));
    await page.goto("/");
    await expect(page.getByText("12日連続・今日はまだ")).toBeVisible();
    await expect(page).toHaveScreenshot("home-streak-pending.png", {
      fullPage: true,
    });
  });

  test("home-no-streak", async ({ page }) => {
    // 今週は月曜だけ答え、昨日も今日も答えていない
    await resetWithAnswers(defaultSubjects(), daysAgo(3));
    await answerPythonLast(daysAgo(3));
    await page.goto("/");
    await expect(
      page.getByText("今日解くと連続日数が始まります"),
    ).toBeVisible();
    await expect(page).toHaveScreenshot("home-no-streak.png", {
      fullPage: true,
    });
  });

  test("home-long", async ({ page }) => {
    // 今日を含めて9999日続いている
    await resetWithAnswers(defaultSubjects());
    await insertStreak(range(1, 9998));
    await answerPythonLast();
    await page.goto("/");
    await expect(page.getByText("9,999日連続")).toBeVisible();
    await expect(page).toHaveScreenshot("home-long.png", { fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page).toHaveScreenshot("home-long-mobile.png", {
      fullPage: true,
    });
  });

  test("home-many", async ({ page }) => {
    const base = [
      "AWS SAA",
      "AWS DVA",
      "Python",
      "TypeScript",
      "Linux",
      "Docker",
      "Kubernetes",
      "SQL",
    ];
    const names = [
      ...base,
      ...base.map((name) => `${name} 2`),
      ...base.map((name) => `${name} 3`),
    ];
    const counts = [
      { correct: 3, wrong: 3, new: 14 },
      { correct: 16, wrong: 11, new: 30 },
      { correct: 43, wrong: 17, new: 34 },
      { correct: 0, wrong: 0, new: 131 },
      { correct: 78, wrong: 87, new: 3 },
      { correct: 55, wrong: 37, new: 113 },
      { correct: 19, wrong: 7, new: 16 },
      { correct: 53, wrong: 9, new: 17 },
    ];
    await resetWithAnswers(
      names.map((name, i) =>
        subjectWith(name, `s${i}`, counts[i % counts.length]),
      ),
    );
    await page.goto("/");
    await expect(
      page.getByRole("list", { name: "科目" }).getByRole("link"),
    ).toHaveCount(names.length);
    await expect(page).toHaveScreenshot("home-many.png", { fullPage: true });
  });
});

// sign out するとセッションが消えるので、保存したログインの状態を使わず、ここで作ったセッションで試す
test("sign out すると Login に移り、戻っても中身は見えない", async ({
  page,
  baseURL,
}) => {
  await page.context().addCookies(await signedInCookies(baseURL ?? ""));
  await page.goto("/");
  await expect(page).toHaveURL("/");

  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL("/login");

  await page.goBack();
  await expect(page).toHaveURL(/^[^?]*\/login\?next=%2F$/);
  await expect(
    page.getByRole("button", { name: "sign in with google" }),
  ).toBeVisible();
});
