// 今の身についている具合の計算。データベースを使わない（ブラウザの Setup からも読むため）

// 印のない問題について、問題の数・一度でも答えた問題の数・最後の答えが正解の問題の数
export type MasteryCounts = {
  total: number;
  answered: number;
  correct: number;
};

export type Mastery = {
  correct: number;
  wrong: number;
  new: number;
  // 解いた問題がないときは null（画面で「—」）
  accuracy: number | null;
};

// スキップは不正解として記録されるので、wrong に入る
export function mastery({ total, answered, correct }: MasteryCounts): Mastery {
  return {
    correct,
    wrong: answered - correct,
    new: total - answered,
    accuracy: answered === 0 ? null : Math.round((correct / answered) * 100),
  };
}
