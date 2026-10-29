import { ImportFlow } from "./import-flow";

// 見出しの下に、取り込む前の確認ではファイル名と Subject を出すので、見出しも ImportFlow の中に置く
export default function ImportPage() {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-4 px-4 pt-6 pb-10">
      <ImportFlow />
    </main>
  );
}
