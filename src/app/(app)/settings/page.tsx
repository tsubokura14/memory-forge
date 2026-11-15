import { PageHeader } from "@/components/page-header";
import { ThemePicker } from "./theme-picker";

// Settings。戻るリンク・見出しの下に appearance の枠
export default function SettingsPage() {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-10">
      <PageHeader back={{ href: "/", label: "home" }} title="Settings" />
      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs text-muted">appearance</h2>
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <ThemePicker />
        </div>
      </section>
    </main>
  );
}
