"use server";

import { requireSession } from "@/server/auth/session";
import {
  applyImport,
  type ImportPreview,
  type ImportResult,
  previewImport,
} from "@/server/import/import";

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
