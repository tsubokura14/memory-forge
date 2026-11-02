// 出す問題の選び方と、start に添える数。データベースは使わない（Setup の画面からも読む）

export type Order = "in-order" | "random" | "lowest-accuracy";
export type Count = "all" | 5 | 10 | 20;

// id は questions.id。取り込んだ順に増える
export type Candidate = {
  id: number;
  correctCount: number;
  answerCount: number;
};

export type Notice = "none" | "few" | "unanswered";

// 乱数は、テストで並びを決められるように引数で受け取る
export function pickQuestions<T extends Candidate>(
  candidates: T[],
  order: Order,
  count: Count,
  random: () => number = Math.random,
): T[] {
  const byId = candidates.toSorted((a, b) => a.id - b.id);
  const ordered =
    order === "in-order"
      ? byId
      : order === "random"
        ? shuffle(byId, random)
        : lowestAccuracyFirst(byId, random);
  return count === "all" ? ordered : ordered.slice(0, count);
}

// 一度も解いていない問題は出さない（復習に使うため）。同じ正答率の問題は、その中で混ぜる
function lowestAccuracyFirst<T extends Candidate>(
  candidates: T[],
  random: () => number,
): T[] {
  const answered = candidates
    .filter((q) => q.answerCount > 0)
    .toSorted(compareAccuracy);
  const result: T[] = [];
  let group: T[] = [];
  for (const q of answered) {
    if (group.length > 0 && compareAccuracy(group[0], q) !== 0) {
      result.push(...shuffle(group, random));
      group = [];
    }
    group.push(q);
  }
  result.push(...shuffle(group, random));
  return result;
}

// 割り算の小数で比べると、1/2 と 2/4 が同じにならないことがあるので、掛け算で比べる
function compareAccuracy(a: Candidate, b: Candidate): number {
  return a.correctCount * b.answerCount - b.correctCount * a.answerCount;
}

// Fisher–Yates
function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// start に添える数と、案内の種類。stats は、選んだ Topic（All なら全部）の問題の数と解いた問題の数。
// 文言（Topic の名前か Subject の名前か）は画面で決める
export function startNotice(
  stats: { total: number; answered: number },
  order: Order,
  count: Count,
): { count: number; notice: Notice } {
  const available = order === "lowest-accuracy" ? stats.answered : stats.total;
  if (available === 0 && order === "lowest-accuracy") {
    return { count: 0, notice: "unanswered" };
  }
  if (count === "all" || available >= count) {
    return { count: count === "all" ? available : count, notice: "none" };
  }
  return { count: available, notice: "few" };
}
