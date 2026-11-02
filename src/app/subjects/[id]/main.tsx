// Setup の中身の幅と、見出しの戻るリンク（page.tsx の読み込み中・エラーと、study.tsx の Setup で同じものを使う）
export const BACK = { href: "/", label: "back" };
export const KICKER = "study setup";

export function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
      {children}
    </main>
  );
}
