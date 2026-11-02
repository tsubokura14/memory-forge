// 答え合わせ。データベースは使わない（記録は answer.ts）

// 選んだ記号の集まりが、正解とちょうど同じときだけ正解（複数選択の部分点はない）。選んだ順は問わない
export function gradeAnswer(correct: string[], selected: string[]): boolean {
  const chosen = new Set(selected);
  return (
    chosen.size === correct.length &&
    correct.every((letter) => chosen.has(letter))
  );
}
