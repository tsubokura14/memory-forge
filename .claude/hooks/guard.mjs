// AIが読んではいけないものを読む操作と、Git のフックを外すコマンドを止める（.claude/settings.json の hooks から呼ぶ）
// CLAUDE.md の文章だけでは、確認の出ない読み取り（リポジトリの中の過去の docs/changes/）が止まらないため
// 止めるときは exit 2 で終える。0 と 2 以外で終わると Claude Code は止めずに通すので、途中で失敗しても止める側に倒す
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const isWindows = process.platform === "win32";

function block(message) {
  process.stderr.write(message + "\n");
  process.exit(2);
}

// Git Bash の書き方（/c/Users/...）も Windows のパスに直し、大文字・小文字をそろえて比べる
function normalize(p, base) {
  let s = String(p);
  if (isWindows) s = s.replace(/^\/([a-zA-Z])\//, "$1:/");
  s = path.resolve(base, s).replace(/\\/g, "/");
  return isWindows ? s.toLowerCase() : s;
}

function isInside(target, dir) {
  return target === dir || target.startsWith(dir.replace(/\/$/, "") + "/");
}

// 今取り組んでいるもの（会話で名前の出た仕様ファイル、/dev-proto を使ったか）を、会話ごとに一時ファイルに残す
function statePath(input) {
  return path.join(os.tmpdir(), "claude-guard", `${input.session_id}.json`);
}

function loadState(input) {
  try {
    return JSON.parse(fs.readFileSync(statePath(input), "utf8"));
  } catch {
    return { specs: [], proto: false };
  }
}

function record(input, commandName, text) {
  const state = loadState(input);
  const name = String(commandName || "").replace(/^\//, "");
  if (name === "dev-proto" || /^\s*\/dev-proto\b/.test(text)) state.proto = true;
  for (const m of String(text).matchAll(/docs[\\/]changes[\\/][^\s"'`()<>]+?\.md/g)) {
    const spec = m[0].replace(/\\/g, "/");
    if (!state.specs.includes(spec)) state.specs.push(spec);
  }
  fs.mkdirSync(path.dirname(statePath(input)), { recursive: true });
  fs.writeFileSync(statePath(input), JSON.stringify(state));
}

// このブランチで足した・変えた仕様ファイル（/dev-spec で作った直後など、まだ main にないもの）
function changedSpecs(root) {
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  let names = git("ls-files", "--others", "--exclude-standard", "--", "docs/changes");
  for (const main of ["main", "origin/main"]) {
    try {
      names += git("diff", "--name-only", git("merge-base", "HEAD", main).trim(), "--", "docs/changes");
      break;
    } catch {
      // 手元に main がなければ origin/main で比べる。どちらもなければ、まだ Git に入れていないファイルだけにする
    }
  }
  return names.split("\n").filter(Boolean);
}

// 読んでよい docs/changes/ のもの：_template.md、会話で名前の出た仕様ファイル、このブランチで足した・変えた仕様ファイルと、同じ名前のフォルダ
function currentSpecs(input, root) {
  return [...loadState(input).specs, ...changedSpecs(root)].map((s) => s.replace(/\.md$/, "").toLowerCase());
}

function isCurrent(rel, current) {
  return rel === "docs/changes/_template.md" || current.some((s) => rel === `${s}.md` || isInside(rel, s));
}

// ルートや docs/ を検索したとき、過去の仕様ファイルの中身が結果に出るか
// Grep は .rgignore に従うので、そこで docs/changes/ を外してあれば出ない。ただし glob を付けると、ripgrep は .rgignore より glob を優先する
function grepReachesPastSpecs(input, root, rel, glob) {
  let ignored = false;
  try {
    ignored = fs.readFileSync(path.join(root, ".rgignore"), "utf8").split(/\r?\n/).some((line) => line.trim() === "/docs/changes/*");
  } catch {
    // .rgignore がなければ、外していないものとして扱う
  }
  if (!ignored) return true;
  if (!glob) return false;
  const current = currentSpecs(input, root);
  const files = execFileSync("git", ["-C", root, "ls-files", "--cached", "--others", "--exclude-standard", "--", "docs/changes"], { encoding: "utf8" });
  return files
    .split("\n")
    .filter(Boolean)
    .map((f) => (isWindows ? f.toLowerCase() : f))
    .filter((f) => !isCurrent(f, current))
    .some((f) => path.posix.matchesGlob(path.posix.relative(rel, f), glob) || path.posix.matchesGlob(path.posix.basename(f), glob));
}

function checkRead(input) {
  const cwd = input.cwd || process.cwd();
  const roots = [process.env.CLAUDE_PROJECT_DIR, cwd].filter(Boolean).map((r) => normalize(r, cwd));
  const t = input.tool_input || {};
  const targets = [];
  if (input.tool_name === "Read") targets.push(t.file_path);
  if (input.tool_name === "Grep" || input.tool_name === "Glob") targets.push(t.path || cwd);

  for (const raw of targets.filter(Boolean)) {
    const target = normalize(raw, cwd);
    const root = roots.find((r) => isInside(target, r));

    if (!root) {
      const allowed = [input.scratchpad_dir, os.tmpdir(), path.join(os.homedir(), ".claude")].filter(Boolean).map((d) => normalize(d, cwd));
      if (allowed.some((d) => isInside(target, d)) || loadState(input).proto) continue;
      block(`リポジトリの外（${raw}）は読まない。画面のプロトタイプのフォルダかもしれないため（読めるのは /dev-proto の会話だけ）。要るなら、ほかの方法で読もうとせずに止まって人間に伝える。`);
    }

    const rel = path.posix.relative(root, target);
    const above = rel === "" || (rel !== "docs/changes" && isInside("docs/changes", rel));
    if (input.tool_name === "Grep" && above && grepReachesPastSpecs(input, root, rel, t.glob)) {
      block(`この検索（${rel || "リポジトリ全体"}${t.glob ? `、glob ${t.glob}` : ""}）では、過去の docs/changes/ の中身も結果に出る。path を docs/changes/ を含まないフォルダにするか、glob を *.md に当たらないもの（*.ts など）にする。.rgignore の「/docs/changes/*」が消えていたら、止まって人間に伝える。`);
    }
    // Glob はファイル名しか返さないので、docs/changes/ の一覧は止めない
    if (input.tool_name === "Glob" || !isInside(rel, "docs/changes")) continue;
    if (isCurrent(rel, currentSpecs(input, root))) continue;
    block(`${rel} は、今取り組んでいる仕様ファイルではないので読まない（CLAUDE.md「読むファイル」）。今の仕様ファイルなら、人間にそのパスをメッセージかスキルの引数で書いてもらう。`);
  }

  // Grep の glob で docs/changes/ を指して、過去の仕様ファイルの中身を探すのも止める
  if (input.tool_name === "Grep" && /docs[\\/]changes/.test(String(t.glob || ""))) {
    block("docs/changes/ の中は検索しない。今の仕様ファイルは、パスを指定して読む。");
  }
}

// コマンドに書かれた、リポジトリの外を指すパス（../xxx-prototype、C:/Users/... など）を止める。Read と同じく、プロトタイプのフォルダを読ませないため
// 見るのはホームフォルダの中だけ。/dev/null や C:/Program Files などはプロトタイプの置き場所ではなく、止めるとふつうの作業が止まるため
function checkOutsidePaths(input, command) {
  if (loadState(input).proto) return;
  const cwd = input.cwd || process.cwd();
  const home = normalize(os.homedir(), cwd);
  const allowed = [process.env.CLAUDE_PROJECT_DIR, cwd, input.scratchpad_dir, os.tmpdir(), path.join(os.homedir(), ".claude")].filter(Boolean).map((d) => normalize(d, cwd));
  for (let token of command.split(/[\s"'`;|&<>()=,]+/)) {
    if (!token || token.includes("://")) continue;
    if (token.startsWith("~")) token = os.homedir() + token.slice(1);
    // 絶対パスか、.. でさかのぼるパスだけを見る（main..HEAD のような git の範囲は、.. の前後が / でないので当たらない）
    if (!/^([\\/]|[a-z]:[\\/])/i.test(token) && !/(^|[\\/])\.\.([\\/]|$)/.test(token)) continue;
    const target = normalize(token, cwd);
    if (isInside(target, home) && !allowed.some((d) => isInside(target, d))) {
      block(`リポジトリの外（${token}）は、コマンドでも読まない・触らない。画面のプロトタイプのフォルダかもしれないため（触れるのは /dev-proto の会話だけ）。要るなら、止まって人間に伝える。`);
    }
  }
}

function checkCommand(input) {
  const command = String((input.tool_input || {}).command || "");
  // git -c core.hooksPath=... push、git config core.hooksPath ...、git push --no-verify の形を止める（大文字・小文字は問わない）
  if (/\bgit\b.*(-c\s*\S*hookspath|\bconfig\b.*hookspath|--no-verify)/i.test(command)) {
    block("Git のフック（main への push を止めるもの）を外す・飛ばすコマンドは使わない。");
  }
  checkOutsidePaths(input, command);

  // cat、Get-Content、git show main:... で .env と過去の docs/changes/ を読むのも止める（settings.json の deny と Read のフックは、コマンドには効かない）
  // 見るのはコマンドに書かれたパスだけ。grep -r docs のように、パスを書かずに中を読むものは止められない
  // .env.example は秘密情報を含まないので通す。--env-file は読み込ませるだけで、中身は会話に出ないので通す
  for (const m of command.matchAll(/(^|[^\w.$-])\.env((?:\.[\w-]+)*)(?![\w-])/g)) {
    if (/\.(example|sample|template)$/i.test(m[2]) || /--env-file[= ]$/.test(command.slice(0, m.index + m[1].length))) continue;
    block(".env は、コマンドでも読まない・触らない（秘密情報が会話に入るため）。中身が要るなら、止まって人間に伝える。");
  }
  const refs = [...command.matchAll(/docs[\\/]changes(?:[\\/]([^\s"'`;|&<>()]*))?/gi)];
  if (refs.length === 0) return;
  const root = normalize(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd(), process.cwd());
  const current = currentSpecs(input, root);
  for (const m of refs) {
    const rel = `docs/changes/${(m[1] || "").replace(/\\/g, "/")}`.replace(/\/+$/, "").toLowerCase();
    if (isCurrent(rel, current)) continue;
    block(`${rel} は、今取り組んでいる仕様ファイルではないので、コマンドでも読まない・触らない（CLAUDE.md「読むファイル」）。今の仕様ファイルなら、人間にそのパスをメッセージかスキルの引数で書いてもらう。`);
  }
}

// pr-check（.claude/agents/pr-check.md）は、差分とログを見るだけにする
function checkPrCheckCommand(input) {
  const command = String((input.tool_input || {}).command || "").trim();
  if (!/^git (diff|log|show|status)\b/.test(command) || /[;&|<>`]|\$\(/.test(command)) {
    block("pr-check で使えるコマンドは、1つの git diff / git log / git show / git status だけ。");
  }
}

// test-runner（.claude/agents/test-runner.md）は、テストを実行して結果を返すだけにする
// テストのコマンドは技術で変わるので、通すものではなく、止めるもの（基準の画像の更新、git の書き込み、ファイルを変える操作）を決める
function checkTestRunnerCommand(input) {
  const command = String((input.tool_input || {}).command || "");
  if (/update-?snapshots?|--update\b|(^|\s)-u(\s|$)/i.test(command)) {
    block("test-runner は基準の画像を更新しない。撮り直すかどうかは、呼んだ側が決める。");
  }
  if (/\bgit\s+(add|commit|push|switch|checkout|restore|reset|clean|stash|merge|rebase|rm|mv|tag|branch)\b/.test(command)) {
    block("test-runner は git で書き込まない。");
  }
  if (/(^|[;&|]\s*)(rm|mv|cp|del|rmdir)\s|(^|[^0-9&>])>{1,2}\s*[^&\s]/.test(command)) {
    block("test-runner はファイルを消す・動かす・書き出す操作をしない。");
  }
}

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
  if (process.argv[2] === "pr-check") {
    checkPrCheckCommand(input);
  } else if (process.argv[2] === "test-runner") {
    checkTestRunnerCommand(input);
  } else if (input.hook_event_name === "SessionStart") {
    // clone し直すと core.hooksPath は消えるので、会話を始めるたびに設定し直す
    execFileSync("git", ["-C", process.env.CLAUDE_PROJECT_DIR || input.cwd, "config", "core.hooksPath", ".githooks"]);
  } else if (input.hook_event_name === "UserPromptSubmit") {
    record(input, "", input.prompt);
  } else if (input.hook_event_name === "UserPromptExpansion") {
    const args = input.command_args;
    record(input, input.command_name, Array.isArray(args) ? args.join(" ") : args || "");
  } else if (input.tool_name === "Skill") {
    record(input, input.tool_input?.skill, `${input.tool_input?.args || ""}`);
  } else if (["Read", "Grep", "Glob"].includes(input.tool_name)) {
    checkRead(input);
  } else if (["Bash", "PowerShell"].includes(input.tool_name)) {
    checkCommand(input);
  }
} catch (error) {
  // 読み取りとコマンドの確かめで失敗したら止める。記録や設定の失敗では、作業は止めない
  const checking = input && ["Read", "Grep", "Glob", "Bash", "PowerShell"].includes(input.tool_name);
  if (checking || ["pr-check", "test-runner"].includes(process.argv[2])) block(`.claude/hooks/guard.mjs が失敗したので止めた：${error.message}`);
  process.stderr.write(`.claude/hooks/guard.mjs: ${error.message}\n`);
}
process.exit(0);
