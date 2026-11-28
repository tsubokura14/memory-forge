// 問題文・選択肢・解説。サーバーで kinari-md が変換した HTML（src/server/questions/render.ts）を、本文の入れ物に入れる。
// 見た目は kinari-md/body.css、入れ物ごとの文字の大きさなどは src/styles/question-body.css の data-body で決める。
// HTML は kinari-md がいつも安全にしたもの（データの中のタグは文字にし、決まった形でないリンクと画像は通さない）なので、そのまま入れてよい
export function RichText({
  html,
  body,
}: {
  html: string;
  body: "question" | "choice" | "explanation" | "preview" | "preview-choice";
}) {
  return (
    <div
      className="kinari-body min-w-0"
      data-body={body}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
