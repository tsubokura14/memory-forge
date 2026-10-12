// Claude Code の PostToolUse フック（.claude/settings.json）。AIが編集したファイルだけを、Prettier で整形し、ESLint で直す。
// 失敗しても AI の作業を止めないように、いつも終了コード 0 で終わる
import { spawnSync } from "node:child_process";
import { extname, isAbsolute, join, relative } from "node:path";

const targets = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".json"]);
const lintTargets = new Set([".ts", ".tsx", ".js", ".mjs"]);

try {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  // Windows の PowerShell から渡すと先頭に BOM が付くことがあるので外す
  const input = JSON.parse(
    Buffer.concat(chunks).toString("utf8").replace(/^﻿/, ""),
  );
  const filePath = input?.tool_input?.file_path;
  const projectDir =
    process.env.CLAUDE_PROJECT_DIR ?? input?.cwd ?? process.cwd();
  const ext = typeof filePath === "string" ? extname(filePath) : "";
  const rel = targets.has(ext) ? relative(projectDir, filePath) : "";
  // プロジェクトの外と node_modules の中のファイルは触らない
  const inProject =
    rel !== "" &&
    !rel.startsWith("..") &&
    !isAbsolute(rel) &&
    !rel.split(/[\\/]/).includes("node_modules");

  if (inProject) {
    // node_modules の .cmd は、Windows では shell なしで起動できないので、中の JS を node で直接起動する
    const run = (script, args) =>
      spawnSync(process.execPath, [join(projectDir, script), ...args], {
        cwd: projectDir,
        stdio: ["ignore", "ignore", "inherit"],
      });
    run("node_modules/prettier/bin/prettier.cjs", [
      "--write",
      "--ignore-unknown",
      rel,
    ]);
    if (lintTargets.has(ext)) {
      run("node_modules/eslint/bin/eslint.js", [
        "--fix",
        "--no-warn-ignored",
        rel,
      ]);
    }
  }
} catch (error) {
  console.error(
    `format-on-edit: ${error instanceof Error ? error.message : error}`,
  );
}
process.exit(0);
