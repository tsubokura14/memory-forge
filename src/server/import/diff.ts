// 取り込むファイルの問題と、同じ Subject の取り込み済みの問題を比べる。データベースは使わない
import { choiceLetter, type FileQuestion } from "./validate";

export type Change = { item: string; before: string; after: string };

export type QuestionDiff = {
  added: FileQuestion[];
  replaced: { question: FileQuestion; changes: Change[] }[];
  unchanged: FileQuestion[];
};

// 同じ ID の問題が取り込み済みにあれば、中身を項目ごとに比べる
export function diffQuestions(
  incoming: FileQuestion[],
  stored: FileQuestion[],
): QuestionDiff {
  const storedById = new Map(stored.map((q) => [q.id, q]));
  const result: QuestionDiff = { added: [], replaced: [], unchanged: [] };

  for (const question of incoming) {
    const before = storedById.get(question.id);
    if (before === undefined) {
      result.added.push(question);
      continue;
    }
    const changes = compare(before, question);
    if (changes.length === 0) {
      result.unchanged.push(question);
    } else {
      result.replaced.push({ question, changes });
    }
  }
  return result;
}

// 画面に出す順（topic・type・text・choice A〜・correct・explanation）で、変わった項目だけを返す。
// 選択肢の数が変わったときは、ない側を空にする
function compare(before: FileQuestion, after: FileQuestion): Change[] {
  const pairs: [string, string, string][] = [
    ["topic", before.topic, after.topic],
    ["type", before.type, after.type],
    ["text", before.text, after.text],
  ];
  const choiceCount = Math.max(before.choices.length, after.choices.length);
  for (let i = 0; i < choiceCount; i++) {
    pairs.push([
      `choice ${choiceLetter(i)}`,
      before.choices[i] ?? "",
      after.choices[i] ?? "",
    ]);
  }
  pairs.push(
    ["correct", before.correct.join(", "), after.correct.join(", ")],
    ["explanation", before.explanation, after.explanation],
  );
  return pairs
    .filter(([, b, a]) => b !== a)
    .map(([item, b, a]) => ({ item, before: b, after: a }));
}
