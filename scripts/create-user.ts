// 自分のアカウントを作る（アプリの画面には登録の手段がないため）。
// 使い方：npm run user:create -- --env-file=<接続先を書いた .env のファイル>
// メールアドレスとパスワードは引数ではなく入力で聞く（シェルの履歴に残さないため）。パスワードは画面に出さない。
//
// node が型を外して直接動かすので、ここから読み込むプロジェクトのファイルは、拡張子付きで書き、
// `@/` の別名を使わないもの（schema.ts・connection-url.ts・insert-user.ts）だけにする
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { parseArgs } from "node:util";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { withVerifyFull } from "../src/server/db/connection-url.ts";
import * as schema from "../src/server/db/schema.ts";
import { createUser } from "./insert-user.ts";

// Better Auth の既定の長さの決まりに合わせる
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

async function askHidden(question: string): Promise<string> {
  stdout.write(question);
  // 打った文字を出さないよう、readline の出力を捨てる
  const muted = new Writable({ write: (_chunk, _encoding, done) => done() });
  const rl = createInterface({ input: stdin, output: muted, terminal: true });
  const answer = await rl.question("");
  rl.close();
  stdout.write("\n");
  return answer;
}

async function main() {
  const { values } = parseArgs({ options: { "env-file": { type: "string" } } });
  const envFile = values["env-file"];
  if (!envFile) {
    throw new Error(
      "接続先を --env-file=<ファイル> で指定する（例：npm run user:create -- --env-file=.env.local）",
    );
  }
  process.loadEnvFile(envFile);

  const rl = createInterface({ input: stdin, output: stdout });
  const email = (await rl.question("email: ")).trim();
  rl.close();
  const password = await askHidden("password: ");
  const confirmation = await askHidden("password（もう一度）: ");

  if (!email) throw new Error("メールアドレスが空");
  if (password !== confirmation) throw new Error("パスワードが一致しない");
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new Error(
      `パスワードは ${MIN_PASSWORD_LENGTH}〜${MAX_PASSWORD_LENGTH} 文字にする`,
    );
  }

  const pool = new Pool({
    connectionString: withVerifyFull(process.env.DATABASE_URL),
  });
  try {
    await createUser(drizzle({ client: pool, schema }), { email, password });
  } finally {
    await pool.end();
  }
  console.log(`作った：${email.toLowerCase()}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  // Drizzle は SQL の文だけを message にし、データベースが返した理由（同じメールアドレスがある、表がないなど）は cause に入れる
  if (error instanceof Error && error.cause instanceof Error) {
    console.error(`理由：${error.cause.message}`);
  }
  process.exitCode = 1;
});
