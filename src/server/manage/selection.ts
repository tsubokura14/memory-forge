// Manage で選んでいる Subject・Topic・ページ。覚えた選び方（cookie の値）を読み、今あるものに合わせる。
// データベースは使わない（画面の部品から読む）
import { lastPage } from "./pages";

// topic が null のときは All topics
export type Saved = { subjectId: number; topic: string | null; page: number };

export type Selection = Saved & { total: number };

export type SubjectTopics = {
  id: number;
  topics: { name: string; count: number }[];
};

// cookie の値を読む。ない・読めない・形が違うときは、覚えていないのと同じにする
export function parseSaved(value: string | undefined): Saved | null {
  if (value === undefined) return null;
  let data: unknown;
  try {
    data = JSON.parse(value);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const { subjectId, topic, page } = data as Record<string, unknown>;
  if (!Number.isSafeInteger(subjectId) || !Number.isSafeInteger(page)) {
    return null;
  }
  if (topic !== null && typeof topic !== "string") return null;
  if ((page as number) < 1) return null;
  return { subjectId: subjectId as number, topic, page: page as number };
}

// 覚えていた選び方を、今ある Subject・Topic・ページに合わせる。
// なくなった Subject は最初の Subject と All topics、なくなった Topic は All topics、なくなったページは最後のページにする。
// subjects は取り込んだ順。Subject が0件なら null
export function resolveSelection(
  saved: Saved | null,
  subjects: SubjectTopics[],
): Selection | null {
  if (subjects.length === 0) return null;
  const subject =
    subjects.find((s) => s.id === saved?.subjectId) ?? subjects[0];
  const keepTopic = subject.id === saved?.subjectId;
  const topic = keepTopic
    ? subject.topics.find((t) => t.name === saved?.topic)
    : undefined;
  const total = topic
    ? topic.count
    : subject.topics.reduce((sum, t) => sum + t.count, 0);
  const keepPage = keepTopic && (topic !== undefined || saved?.topic === null);
  const page = keepPage ? Math.min(saved?.page ?? 1, lastPage(total)) : 1;
  return { subjectId: subject.id, topic: topic?.name ?? null, page, total };
}
