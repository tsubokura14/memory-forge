// 問題のファイルの、ID が空（""）かない問題に ID を付ける（npm run questions:ids。docs/design.md の「問題づくり」）。
import { randomInt } from "node:crypto";
import { collectWorkspaceIds, type WorkspaceFile } from "./workspace.ts";

export type IdsTarget = {
  path: string;
  name: string;
  // 読めなかった（ない、など）ときは null
  content: string | null;
};

// content は書き戻す中身。付ける問題がなければ null（書き戻さない）
export type IdsResult =
  | { ok: true; content: string | null; lines: string[] }
  | { ok: false; lines: string[] };

// ID は英小文字と数字の6文字のでたらめな文字列。
// 理由：AI はでたらめな文字列を作るのが苦手で、似た ID が重なりやすいため、スクリプトが付ける。
// 36^6（約22億）通りあるので、数千問でも偶然重なることはほとんどなく、重なったら作り直す
const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const ID_LENGTH = 6;

export function randomId(): string {
  let id = "";
  for (let i = 0; i < ID_LENGTH; i += 1) {
    id += ID_CHARS[randomInt(ID_CHARS.length)];
  }
  return id;
}

// でたらめな文字を作る関数は引数で受け取る（テストで決まった値にするため）
export function assignIds(
  target: IdsTarget,
  workspace: WorkspaceFile[],
  random: () => string = randomId,
): IdsResult {
  if (target.content === null)
    return failed(target.name, "ファイルを読めません。");

  let parsed: unknown;
  try {
    parsed = JSON.parse(target.content);
  } catch {
    return failed(target.name, "JSON として読めません。");
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.questions)) {
    return failed(target.name, "questions の形が違います。");
  }

  const questions: unknown[] = parsed.questions;
  const needsId = (question: unknown): question is Record<string, unknown> =>
    isRecord(question) && (question.id === undefined || question.id === "");

  const count = questions.filter(needsId).length;
  if (count === 0) {
    return {
      ok: true,
      content: null,
      lines: [`${target.name}：ID のない問題はありません。`],
    };
  }

  // 重ねない ID：同じファイルの ID と、questions/ の同じ Subject のほかのファイルの ID。
  // Subject が文字でないファイルは、ほかのファイルと比べられない（誤りは questions:check で出る）
  const used = new Set<string>(
    questions.flatMap((question) =>
      isRecord(question) &&
      typeof question.id === "string" &&
      question.id !== ""
        ? [question.id]
        : [],
    ),
  );
  if (typeof parsed.subject === "string") {
    for (const id of collectWorkspaceIds(
      workspace,
      parsed.subject,
      target.path,
    ).keys()) {
      used.add(id);
    }
  }

  const next = () => {
    let id = random();
    while (used.has(id)) id = random();
    used.add(id);
    return id;
  };

  // 付けた問題は、id をいちばん前の項目にする（書き出しのファイルと同じ並び）
  const updated = questions.map((question) => {
    if (!needsId(question)) return question;
    return Object.fromEntries([
      ["id", next()],
      ...Object.entries(question).filter(([key]) => key !== "id"),
    ]);
  });

  return {
    ok: true,
    // 書き出しのファイル（src/server/manage/export.ts）と同じ形：2文字の字下げ、終わりに改行
    content: `${JSON.stringify({ ...parsed, questions: updated }, null, 2)}\n`,
    lines: [
      `${target.name}：${count.toLocaleString("en-US")}問に ID を付けました。`,
    ],
  };
}

function failed(name: string, message: string): IdsResult {
  return { ok: false, lines: [`${name}：${message}`] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
