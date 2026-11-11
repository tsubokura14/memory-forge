import { expect, test } from "./fixtures";
import {
  insertAnswers,
  resetQuestions,
  type TestQuestion,
  testQuestion,
} from "./questions";
import { SIGNED_IN_STATE, TEST_USER } from "./test-user";

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

async function resetWithAnswers(list: ReturnType<typeof subjectWith>[]) {
  const ids = await resetQuestions(list.map((s) => s.subject));
  const answers = list.flatMap((s) => s.answers);
  if (answers.length > 0) await insertAnswers(answers);
  return ids;
}

test.describe("ログインした状態を保存したもので開く", () => {
  test.use({ storageState: SIGNED_IN_STATE });

  test("home-empty", async ({ page }) => {
    await resetQuestions();
    await page.goto("/");
    await expect(page.getByText("No subjects yet.")).toBeVisible();
    await expect(page).toHaveScreenshot("home-empty.png", { fullPage: true });
  });

  test("home-default：Subject を取り込んだ順に並べ、押すと Setup に移る", async ({
    page,
  }) => {
    // Python の印の付いた問題は数えず、Home には印の数も出さない
    const list = [
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
    const ids = await resetWithAnswers(list);
    await page.goto("/");
    const subjects = page.getByRole("list", { name: "subjects" });
    // 並びは listSubjects の Vitest で確かめる。ここでは読み終えるのを待つ
    await expect(subjects.getByRole("link")).toHaveCount(list.length);
    await expect(page).toHaveScreenshot("home-default.png", { fullPage: true });

    await subjects.getByRole("link", { name: "Python" }).click();
    await expect(page).toHaveURL(`/subjects/${ids[1]}`);
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
      page.getByRole("list", { name: "subjects" }).getByRole("link"),
    ).toHaveCount(names.length);
    await expect(page).toHaveScreenshot("home-many.png", { fullPage: true });
  });
});

// sign out するとセッションが消えるので、保存したログインの状態を使わず、ここで sign in したセッションで試す
test("sign out すると Login に移り、戻っても中身は見えない", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("email").fill(TEST_USER.email);
  await page.getByLabel("password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "sign in" }).click();
  await expect(page).toHaveURL("/");

  await page.getByRole("button", { name: "sign out" }).click();
  await expect(page).toHaveURL("/login");

  await page.goBack();
  await expect(page).toHaveURL(/^[^?]*\/login\?next=%2F$/);
  await expect(page.getByRole("button", { name: "sign in" })).toBeVisible();
});
