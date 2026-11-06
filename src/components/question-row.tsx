import type { ManageQuestion } from "@/server/manage/list";

// Manage の問題の行。押しても、問題の中身は開かない。
// 1行目に問題文の1行目（長いときは「…」で切る）、2行目に ID・Topic・multi（multi のときだけ）・正答率と解いた回数
export function QuestionRow({ question }: { question: ManageQuestion }) {
  const tag = "rounded-sm border border-border px-1.5";
  return (
    <li className="flex flex-col gap-1 px-4 py-3">
      <p className="truncate text-sm">{question.text.split("\n")[0]}</p>
      <p className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
        <span>{question.questionId}</span>
        <span className={tag}>{question.topic}</span>
        {question.type === "multiple" && <span className={tag}>multi</span>}
        <span>
          {question.accuracy === null ? "—" : `${question.accuracy}%`} ·{" "}
          {question.tries} tries
        </span>
      </p>
    </li>
  );
}
