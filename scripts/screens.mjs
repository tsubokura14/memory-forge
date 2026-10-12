// 画面を撮る・比べるテストを、Playwright 公式の Docker イメージの中で動かす（手元用。CI はジョブの container: で同じイメージを使う）
//   node scripts/screens.mjs test [Playwright の引数...]
//   node scripts/screens.mjs update <画面のテストのファイル...>
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [mode, ...args] = process.argv.slice(2);

if (mode !== "test" && mode !== "update") {
  console.error("使い方: node scripts/screens.mjs <test|update> [ファイル...]");
  process.exit(1);
}
// 意図しない画面まで撮り直さないように、撮り直すときは画面のテストのファイルを必ず指定させる
if (mode === "update" && args.length === 0) {
  console.error(
    "撮り直す画面のテストのファイルを指定する（例：npm run screens:update -- e2e/home.spec.ts）",
  );
  process.exit(1);
}

// イメージの版は、入れた @playwright/test の版に合わせる（docs/design.md の「画面の画像を撮る・比べる仕組み」）
const { version } = JSON.parse(
  readFileSync("node_modules/@playwright/test/package.json", "utf8"),
);
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

const playwrightArgs = [
  "playwright",
  "test",
  ...(mode === "update" ? ["--update-snapshots=changed"] : []),
  ...args,
];

const dockerArgs = [
  "run",
  "--rm",
  "--ipc=host",
  "-v",
  `${process.cwd()}:/work`,
  // Windows の node_modules と .next には Windows 用のファイルが入っていて Linux では動かないので、名前付きボリュームで隠す
  "-v",
  "memory-forge-node-modules:/work/node_modules",
  "-v",
  "memory-forge-next:/work/.next",
  "-w",
  "/work",
  image,
  "sh",
  "-c",
  `npm ci && npx ${playwrightArgs.map((a) => `'${a}'`).join(" ")}`,
];

const result = spawnSync("docker", dockerArgs, { stdio: "inherit" });
process.exit(result.status ?? 1);
