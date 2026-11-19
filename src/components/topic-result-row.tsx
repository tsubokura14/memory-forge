import type { TopicResult } from "@/server/solve/result";

// 解き終わりの結果の Topic の行。名前は決まった幅に置き（スマホの幅では狭くする）、長いときは「…」で切る。
// 割合の線は、名前と得点の間の残りの幅いっぱいに、正解（success）・前は正解したのに今回間違えた（warning）・それ以外の不正解（danger）の順に塗る
export function TopicResultRow({ topic }: { topic: TopicResult }) {
  const width = (n: number) => `${(n / topic.total) * 100}%`;
  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <span className="w-24 shrink-0 truncate text-base sm:w-48">
        {topic.name}
      </span>
      <span
        aria-hidden
        className="flex h-1 flex-1 overflow-hidden rounded-sm bg-border"
      >
        <span className="bg-success" style={{ width: width(topic.correct) }} />
        <span className="bg-warning" style={{ width: width(topic.slipped) }} />
        <span className="bg-danger" style={{ width: width(topic.wrong) }} />
      </span>
      <span className="w-10 shrink-0 text-right text-sm tabular-nums">
        {topic.correct}/{topic.total}
      </span>
    </li>
  );
}
