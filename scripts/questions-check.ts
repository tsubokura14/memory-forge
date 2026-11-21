// 問題のファイルを、Import と同じ決まりで確かめる。questions/ の同じ Subject のほかのファイルとの ID の重なりも見る。
// 使い方：npm run questions:check -- <ファイル...>
// 決まりと出力の文は src/server/authoring/check.ts。ここは、ファイルを読んで出力し、終わりのコードを決めるだけ。
//
// node が型を外して直接動かすので、ここから読み込むプロジェクトのファイルは、拡張子付きで書き、`@/` の別名を使わない
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { checkQuestionFile } from "../src/server/authoring/check.ts";
import type { WorkspaceFile } from "../src/server/authoring/workspace.ts";

const WORKSPACE_DIR = path.resolve(import.meta.dirname, "..", "questions");

function readText(file: string): string | null {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

// questions/ の直下の *.json。フォルダがなければ、ほかのファイルはないとする
function readWorkspace(): WorkspaceFile[] {
  let names: string[];
  try {
    names = readdirSync(WORKSPACE_DIR).filter((name) => name.endsWith(".json"));
  } catch {
    return [];
  }
  return names.flatMap((name) => {
    const file = path.join(WORKSPACE_DIR, name);
    const content = readText(file);
    return content === null ? [] : [{ path: file, name, content }];
  });
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "確かめるファイルを指定する（例：npm run questions:check -- questions/python.json）",
    );
    process.exitCode = 1;
    return;
  }

  // npm run は package.json のフォルダで動くので、相対パスは打った場所（INIT_CWD）から解く
  const base = process.env.INIT_CWD ?? process.cwd();
  const workspace = readWorkspace();
  let ok = true;
  for (const arg of args) {
    const file = path.resolve(base, arg);
    const result = checkQuestionFile(
      { path: file, name: path.basename(file), content: readText(file) },
      workspace,
    );
    for (const line of result.lines) console.log(line);
    if (!result.ok) ok = false;
  }
  // 誤りが1つでもあれば 0 以外にする（スキルが、直すかどうかを判断できるように）
  if (!ok) process.exitCode = 1;
}

main();
