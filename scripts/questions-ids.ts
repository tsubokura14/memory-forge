// 問題のファイルの、ID が空かない問題に ID を付けて書き戻す。questions/ の同じ Subject のほかのファイルの ID とも重ねない。
// 使い方：npm run questions:ids -- <ファイル>
// 決まりと出力の文は src/server/authoring/ids.ts。ここは、ファイルを読んで書き戻し、出力と終わりのコードを決めるだけ。
//
// node が型を外して直接動かすので、ここから読み込むプロジェクトのファイルは、拡張子付きで書き、`@/` の別名を使わない
import { writeFileSync } from "node:fs";
import path from "node:path";
import { assignIds } from "../src/server/authoring/ids.ts";
import { readText, readWorkspace } from "./questions-workspace.ts";

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error(
      "ID を付けるファイルを1つ指定する（例：npm run questions:ids -- questions/python-decorators.json）",
    );
    process.exitCode = 1;
    return;
  }

  // npm run は package.json のフォルダで動くので、相対パスは打った場所（INIT_CWD）から解く
  const base = process.env.INIT_CWD ?? process.cwd();
  const file = path.resolve(base, args[0]);
  const result = assignIds(
    { path: file, name: path.basename(file), content: readText(file) },
    readWorkspace(),
  );
  if (result.ok && result.content !== null) {
    writeFileSync(file, result.content, "utf8");
  }
  for (const line of result.lines) console.log(line);
  if (!result.ok) process.exitCode = 1;
}

main();
