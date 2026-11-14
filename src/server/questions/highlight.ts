// コードブロックの色分け（#7）。データベースは使わない（画面の部品から読む）。
// Prism.tokenize は待たずに結果を返すので、組み立てるときにその場で呼べば、最初の表示から色が付く
import Prism from "prismjs";
// 言語のファイルは、グローバルの Prism に文法を足すので、prismjs のあとに読み込む。
// TypeScript は JavaScript の文法を広げて作るので、JavaScript より後にする（JavaScript は prismjs の本体にも入っているが、順番を明示する）
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";

export type CodeKind =
  "keyword" | "string" | "function" | "builtin" | "decorator" | "comment";

export type Segment = { text: string; kind: CodeKind | null };

const KINDS: readonly string[] = [
  "keyword",
  "string",
  "function",
  "builtin",
  "decorator",
  "comment",
] satisfies CodeKind[];

// 色を付ける言語の表。Prism.languages をそのまま引かないのは、Prism には markup・css・clike なども
// 最初から入っていて、仕様の6つの言語のほかにも色が付いてしまうため
const GRAMMARS: Record<string, Prism.Grammar> = {
  python: Prism.languages.python,
  py: Prism.languages.python,
  typescript: Prism.languages.typescript,
  ts: Prism.languages.typescript,
  javascript: Prism.languages.javascript,
  js: Prism.languages.javascript,
  sql: Prism.languages.sql,
  bash: Prism.languages.bash,
  sh: Prism.languages.bash,
  shell: Prism.languages.bash,
  json: Prism.languages.json,
};

// コードを、色の種類ごとの切れ目に分ける。表にない言語の名前と空の名前は、全体を null の1つにする
export function highlight(code: string, language: string): Segment[] {
  const grammar = GRAMMARS[language.toLowerCase()];
  if (!grammar) return [{ text: code, kind: null }];
  const segments: Segment[] = [];
  flatten(Prism.tokenize(code, grammar), null, segments);
  return segments;
}

// 入れ子の言葉（文字列の中の {...}、デコレーターの中の . など）は、内側から外側へ見て、
// 最初に当てはまった種類にする。内側で当てはまらなければ、外側の種類を受け継ぐ
function flatten(
  stream: Prism.TokenStream,
  outer: CodeKind | null,
  segments: Segment[],
) {
  if (typeof stream === "string") {
    if (stream !== "") segments.push({ text: stream, kind: outer });
  } else if (Array.isArray(stream)) {
    for (const item of stream) flatten(item, outer, segments);
  } else {
    flatten(stream.content, kindOf(stream) ?? outer, segments);
  }
}

// Prism の種類（type）、なければ別名（alias）で、6つの種類に当てはめる
function kindOf(token: Prism.Token): CodeKind | null {
  const aliases =
    typeof token.alias === "string" ? [token.alias] : (token.alias ?? []);
  const found = [token.type, ...aliases].find((name) => KINDS.includes(name));
  return (found as CodeKind | undefined) ?? null;
}
