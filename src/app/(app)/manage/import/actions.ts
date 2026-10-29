"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import {
  applyImport,
  type ImportPreview,
  type ImportResult,
  previewImport,
} from "@/server/import/import";

// docs/design.md の「ログインの確かめ」
async function requireSession() {
  const { session } = await getSession(await headers());
  if (!session) redirect("/login");
}

export async function previewImportAction(
  content: string,
): Promise<ImportPreview> {
  await requireSession();
  return previewImport(content);
}

export async function applyImportAction(
  content: string,
): Promise<ImportResult> {
  await requireSession();
  return applyImport(content);
}
