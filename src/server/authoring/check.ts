// 問題のファイルを1つ確かめ、端末に出す文にする（npm run questions:check。docs/design.md の「問題づくり」）。
import {
  countProblems,
  type FileError,
  validateQuestionFile,
} from "../import/validate.ts";
import { collectWorkspaceIds, type WorkspaceFile } from "./workspace.ts";

export type CheckTarget = {
  path: string;
  name: string;
  // 読めなかった（ない、など）ときは null
  content: string | null;
};

export type CheckResult = { ok: boolean; lines: string[] };

// 出力は1行ずつにする（スキルが読みやすく、端末で表の列がそろわないため）。
// 誤りの行は、ID・項目・内容を2つの空白で区切り、頭を2つの空白で下げる
export function checkQuestionFile(
  target: CheckTarget,
  workspace: WorkspaceFile[],
): CheckResult {
  if (target.content === null) {
    return { ok: false, lines: [`${target.name}：ファイルを読めません。`] };
  }

  const result = validateQuestionFile(target.content);
  if (!result.ok) return failed(target.name, result.errors);

  // ほかのファイルとの重なりは、ファイルそのものの誤りがなくなってから見る（誤りがあると Subject や ID が決まらないため）
  const { subject, questions } = result.file;
  const others = collectWorkspaceIds(workspace, subject, target.path);
  const overlaps: FileError[] = questions.flatMap((question) => {
    const other = others.get(question.id);
    return other === undefined
      ? []
      : [
          {
            id: question.id,
            item: "id",
            message: `ほかのファイル（${other}）と ID が重なっています。`,
          },
        ];
  });
  if (overlaps.length > 0) return failed(target.name, overlaps);

  return {
    ok: true,
    lines: [
      `${target.name}：誤りはありません（${subject}・${questions.length.toLocaleString("en-US")}問）。`,
    ],
  };
}

function failed(name: string, errors: FileError[]): CheckResult {
  return {
    ok: false,
    lines: [
      `${name}：${countProblems(errors.length)}があります。`,
      ...errors.map(
        (error) => `  ${error.id}  ${error.item}  ${error.message}`,
      ),
    ],
  };
}
