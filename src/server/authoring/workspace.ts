// 作業場所（questions/）のほかのファイルから、同じ Subject の ID を集める（docs/design.md の「問題づくり」）。
// scripts/ から node が型を外して直接動かすので、データベースもファイルも読まず、読み込みは拡張子付きの相対パスにする

export type WorkspaceFile = {
  // 同じファイルかを比べるためのパス（scripts/ が絶対パスにそろえて渡す）
  path: string;
  // 誤りの文に出す名前
  name: string;
  content: string;
};

// ID → その ID を持つファイルの名前。同じ ID が複数のファイルにあるときは、先に渡されたファイルにする
export function collectWorkspaceIds(
  files: WorkspaceFile[],
  subject: string,
  excludePath: string,
): Map<string, string> {
  const ids = new Map<string, string>();
  for (const file of files) {
    if (file.path === excludePath) continue;
    const parsed = parse(file.content);
    // 読めないファイルは飛ばす（そのファイル自身の誤りは、そのファイルを確かめたときに出る）
    if (parsed === undefined || parsed.subject !== subject) continue;
    for (const id of parsed.ids) {
      if (!ids.has(id)) ids.set(id, file.name);
    }
  }
  return ids;
}

function parse(
  content: string,
): { subject: string; ids: string[] } | undefined {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    return undefined;
  }
  if (!isRecord(value) || typeof value.subject !== "string") return undefined;
  const questions = Array.isArray(value.questions) ? value.questions : [];
  const ids = questions.flatMap((question: unknown) =>
    isRecord(question) && typeof question.id === "string" && question.id !== ""
      ? [question.id]
      : [],
  );
  return { subject: value.subject, ids };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
