import { describe, expect, test } from "vitest";
import { pickQuestions, startNotice, topicStats } from "./pick";

function candidate(id: number, correctCount = 0, answerCount = 0) {
  return { id, correctCount, answerCount };
}

const ids = (picked: { id: number }[]) => picked.map((q) => q.id);

describe("pickQuestions", () => {
  test("in order：取り込んだ順（id の順）に並べる", () => {
    const picked = pickQuestions(
      [candidate(3), candidate(1), candidate(2)],
      "in-order",
      "all",
    );
    expect(ids(picked)).toEqual([1, 2, 3]);
  });

  test("random：全部を混ぜる", () => {
    const candidates = [candidate(1), candidate(2), candidate(3)];
    const picked = pickQuestions(candidates, "random", "all", () => 0);
    expect(ids(picked)).not.toEqual([1, 2, 3]);
    expect(ids(picked).toSorted()).toEqual([1, 2, 3]);
  });

  test("lowest accuracy：一度も解いていない問題を除き、正答率の低い順に並べる", () => {
    const picked = pickQuestions(
      [
        candidate(1, 1, 2),
        candidate(2),
        candidate(3, 0, 1),
        candidate(4, 3, 3),
      ],
      "lowest-accuracy",
      "all",
    );
    expect(ids(picked)).toEqual([3, 1, 4]);
  });

  test("lowest accuracy：同じ正答率の問題は、その中で混ぜる", () => {
    const candidates = [candidate(1, 1, 2), candidate(2, 2, 4), candidate(3)];
    const orders = [0, 0.99].map((r) =>
      ids(pickQuestions(candidates, "lowest-accuracy", "all", () => r)),
    );
    expect(orders).toContainEqual([1, 2]);
    expect(orders).toContainEqual([2, 1]);
  });

  test("選んだ問題数で切る。出せる数より多いときは、ある分だけ", () => {
    const candidates = [1, 2, 3, 4, 5, 6].map((id) => candidate(id));
    expect(ids(pickQuestions(candidates, "in-order", 5))).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(ids(pickQuestions(candidates, "in-order", 10))).toHaveLength(6);
  });
});

describe("startNotice", () => {
  test("出せる数が選んだ問題数と同じなら、その数で案内なし", () => {
    expect(startNotice({ total: 10, answered: 0 }, "in-order", 10)).toEqual({
      count: 10,
      notice: "none",
    });
  });

  test("出せる数が選んだ問題数より1つ少ないと、ある分の数で few", () => {
    expect(startNotice({ total: 9, answered: 0 }, "random", 10)).toEqual({
      count: 9,
      notice: "few",
    });
  });

  test("all は、出せる数の全部で案内なし", () => {
    expect(startNotice({ total: 8, answered: 0 }, "in-order", "all")).toEqual({
      count: 8,
      notice: "none",
    });
  });

  test("lowest accuracy は、解いた問題の数で数える", () => {
    expect(
      startNotice({ total: 12, answered: 3 }, "lowest-accuracy", 5),
    ).toEqual({ count: 3, notice: "few" });
  });

  test("lowest accuracy で解いた問題がないと unanswered", () => {
    expect(
      startNotice({ total: 12, answered: 0 }, "lowest-accuracy", "all"),
    ).toEqual({ count: 0, notice: "unanswered" });
  });
});

describe("topicStats", () => {
  const topics = [
    { name: "Decorators", total: 12, answered: 3 },
    { name: "Typing", total: 8, answered: 0 },
  ];

  test("Topic を選ぶと、その Topic の数", () => {
    expect(topicStats(topics, "Typing")).toEqual({ total: 8, answered: 0 });
  });

  test("All（null）は、全部の Topic の数を足す", () => {
    expect(topicStats(topics, null)).toEqual({ total: 20, answered: 3 });
  });
});
