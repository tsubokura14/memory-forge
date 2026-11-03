// 解き終わりの結果の数え方。データベースは使わない（解く画面がブラウザで数える）

// 1問ずつの結果。correctBefore は SolveQuestion のもの
export type Outcome = {
  topic: string;
  outcome: "correct" | "incorrect" | "skipped";
  correctBefore: boolean;
};

// slipped は、前は正解したのに今回間違えた（不正解かスキップ）問題。wrong はそれ以外の不正解（スキップを含む）
export type TopicResult = {
  name: string;
  total: number;
  correct: number;
  slipped: number;
  wrong: number;
  accuracy: number;
};

export type SessionResult = {
  correct: number;
  // 答えて間違えた数だけ。スキップは skipped にだけ数える
  incorrect: number;
  skipped: number;
  // 不備の印を付ける機能（#12）ができるまで、いつも 0
  flagged: number;
  total: number;
  accuracy: number;
  topics: TopicResult[];
};

// 得点と % は、スキップを不正解として数える。% は整数に四捨五入する
function accuracyOf(correct: number, total: number): number {
  return Math.round((correct / total) * 100);
}

// topicOrder は Setup の Topic の名前の並び。解いた回に出た順は、random などでは Setup の順と違うので使わない。
// Setup を開いたあとに取り込み直して増えた Topic は、Setup の順のあとに、出た順で置く
export function summarizeSession(
  outcomes: Outcome[],
  topicOrder: string[],
): SessionResult {
  const byTopic = new Map<string, TopicResult>();
  for (const { topic, outcome, correctBefore } of outcomes) {
    let row = byTopic.get(topic);
    if (!row) {
      row = {
        name: topic,
        total: 0,
        correct: 0,
        slipped: 0,
        wrong: 0,
        accuracy: 0,
      };
      byTopic.set(topic, row);
    }
    row.total++;
    if (outcome === "correct") row.correct++;
    else if (correctBefore) row.slipped++;
    else row.wrong++;
  }

  const rank = (name: string) => {
    const i = topicOrder.indexOf(name);
    return i === -1 ? topicOrder.length : i;
  };
  // toSorted は安定なので、Setup にない Topic どうしは出た順のまま
  const topics = [...byTopic.values()]
    .toSorted((a, b) => rank(a.name) - rank(b.name))
    .map((t) => ({ ...t, accuracy: accuracyOf(t.correct, t.total) }));

  const count = (kind: Outcome["outcome"]) =>
    outcomes.filter((o) => o.outcome === kind).length;
  const correct = count("correct");
  return {
    correct,
    incorrect: count("incorrect"),
    skipped: count("skipped"),
    flagged: 0,
    total: outcomes.length,
    accuracy: accuracyOf(correct, outcomes.length),
    topics,
  };
}
