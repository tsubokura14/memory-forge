"use client";

import { Icon } from "@/components/icons";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { Banner } from "@/components/banner";
import { Button, buttonClass } from "@/components/button";
import { ChangeRow } from "@/components/change-row";
import { CountBox } from "@/components/count-box";
import { DropZone } from "@/components/drop-zone";
import { ErrorList } from "@/components/error-list";
import { PageHeader } from "@/components/page-header";
import type { ImportCounts, ImportPreview } from "@/server/import/import";
import {
  countProblems,
  type FileError,
  MAX_FILE_BYTES,
  TOO_LARGE,
} from "@/server/import/validate";
import { applyImportAction, previewImportAction } from "./actions";

type Preview = Extract<ImportPreview, { ok: true }>;

// 画面は、読んだファイルの中身を持っておき、すべて取り込むで同じ中身をもう一度送る（サーバーで確かめ直してから書く）
type Phase =
  // failed はサーバーのエラーのあと。もう一度取り込むで、最後に失敗した操作を同じ中身でやり直す
  | { kind: "select"; failed?: { retry: () => void } }
  | { kind: "checking"; fileName: string }
  | { kind: "errors"; fileName: string; errors: FileError[] }
  | {
      kind: "preview";
      fileName: string;
      content: string;
      preview: Preview;
      importing: boolean;
    }
  | { kind: "done"; subject: string; counts: ImportCounts };

export function ImportFlow() {
  const [phase, setPhase] = useState<Phase>({ kind: "select" });

  async function check(fileName: string, content: string) {
    setPhase({ kind: "checking", fileName });
    let preview: ImportPreview;
    try {
      preview = await previewImportAction(content);
    } catch (error) {
      unstable_rethrow(error);
      // サーバーにつながらないなど。理由は画面に出さない
      setPhase({
        kind: "select",
        failed: { retry: () => check(fileName, content) },
      });
      return;
    }
    setPhase(
      preview.ok
        ? { kind: "preview", fileName, content, preview, importing: false }
        : { kind: "errors", fileName, errors: preview.errors },
    );
  }

  async function chooseFile(file: File) {
    // 大きすぎるファイルは、読まずに・送らずに止める（サーバーが受け取れる大きさを超えるため）
    if (file.size > MAX_FILE_BYTES) {
      setPhase({ kind: "errors", fileName: file.name, errors: [TOO_LARGE] });
      return;
    }
    await check(file.name, await file.text());
  }

  async function importAll(
    fileName: string,
    content: string,
    preview: Preview,
  ) {
    setPhase({ kind: "preview", fileName, content, preview, importing: true });
    try {
      const result = await applyImportAction(content);
      setPhase(
        result.ok
          ? { kind: "done", subject: result.subject, counts: result.counts }
          : { kind: "errors", fileName, errors: result.errors },
      );
    } catch (error) {
      unstable_rethrow(error);
      setPhase({
        kind: "select",
        failed: { retry: () => importAll(fileName, content, preview) },
      });
    }
  }

  const reset = () => setPhase({ kind: "select" });

  return (
    <>
      <PageHeader
        back={{ href: "/manage", label: "問題の管理へ戻る" }}
        crumbs={["問題の管理", "取り込み"]}
        title="取り込み"
      >
        {phase.kind === "preview" && (
          <p className="flex flex-wrap items-center gap-1 text-sm">
            <span className="text-muted">{phase.fileName}</span>
            <Icon name="arrow-right" className="text-base text-muted" />
            <span>{phase.preview.subject}</span>
            {phase.preview.isNewSubject && (
              <span className="ml-1 rounded-sm border border-success px-1.5 text-xs text-success">
                新しい科目
              </span>
            )}
          </p>
        )}
      </PageHeader>

      {phase.kind === "select" && (
        <>
          {phase.failed && (
            <Banner
              action={
                <Button
                  type="button"
                  variant="danger"
                  className="py-1"
                  onClick={phase.failed.retry}
                >
                  もう一度取り込む
                </Button>
              }
            >
              取り込めませんでした。何も取り込んでいません。
            </Banner>
          )}
          <DropZone
            accept=".json,application/json"
            hint=".json"
            onFile={chooseFile}
          />
        </>
      )}

      {phase.kind === "checking" && (
        <DropZone
          accept=".json,application/json"
          hint=".json"
          busy
          onFile={() => {}}
        >
          <p className="text-sm">{phase.fileName}</p>
          <p className="animate-pulse text-xs text-muted">確かめています…</p>
        </DropZone>
      )}

      {phase.kind === "errors" && (
        <>
          <Banner>
            {countProblems(phase.errors.length)}が <span>{phase.fileName}</span>{" "}
            にあります。何も取り込んでいません。
          </Banner>
          <ErrorList errors={phase.errors} />
          <Footer>
            <Button type="button" onClick={reset}>
              別のファイルを選ぶ
            </Button>
          </Footer>
        </>
      )}

      {phase.kind === "preview" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <CountBox
              count={phase.preview.counts.added}
              label="新しい問題"
              tone="success"
            />
            <CountBox
              count={phase.preview.counts.replaced}
              label="置き換える"
              tone={phase.preview.counts.replaced > 0 ? "warning" : "muted"}
            />
            <CountBox
              count={phase.preview.counts.unchanged}
              label="変わらない"
              tone="muted"
            />
          </div>
          {phase.preview.replaced.length > 0 && (
            <section className="mt-4 flex flex-col gap-2">
              <h2 className="text-xs text-muted">置き換える問題</h2>
              {phase.preview.replaced.map((question, index) => (
                <ChangeRow
                  key={question.id}
                  id={question.id}
                  text={question.text}
                  flagged={question.flagged}
                  changes={question.changes}
                  defaultOpen={index === 0}
                />
              ))}
            </section>
          )}
          <Footer>
            <Button
              type="button"
              variant="outline"
              disabled={phase.importing}
              onClick={reset}
            >
              やめる
            </Button>
            <Button
              type="button"
              disabled={phase.importing}
              onClick={() =>
                importAll(phase.fileName, phase.content, phase.preview)
              }
            >
              {phase.importing ? "取り込んでいます…" : "すべて取り込む"}
            </Button>
          </Footer>
        </>
      )}

      {phase.kind === "done" && (
        <div className="flex flex-col items-center gap-2 rounded-md border border-success bg-success-soft px-4 py-8 text-center">
          <p className="flex items-center gap-1 text-base text-success">
            <Icon name="check" className="text-base" />
            {phase.subject} に取り込みました
          </p>
          <p className="text-xs text-muted">
            新しい問題 {phase.counts.added} · 置き換え {phase.counts.replaced} ·
            変わらない {phase.counts.unchanged}
          </p>
          <Link href="/manage" className={`mt-2 ${buttonClass()}`}>
            問題の管理で見る
          </Link>
        </div>
      )}
    </>
  );
}

// 下の区切り線と、右に寄せた操作
function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
      {children}
    </div>
  );
}
