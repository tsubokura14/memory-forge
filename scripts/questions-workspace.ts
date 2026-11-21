// questions:check と questions:ids が使う、ファイルの読み方（作業場所の questions/ と、指定したファイル）。
//
// node が型を外して直接動かすので、ここから読み込むプロジェクトのファイルは、拡張子付きで書き、`@/` の別名を使わない
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { WorkspaceFile } from "../src/server/authoring/workspace.ts";

const WORKSPACE_DIR = path.resolve(import.meta.dirname, "..", "questions");

// 読めなかった（ない、など）ときは null
export function readText(file: string): string | null {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

// questions/ の直下の *.json。フォルダがなければ、ほかのファイルはないとする
export function readWorkspace(): WorkspaceFile[] {
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
