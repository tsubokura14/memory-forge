"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";

// 読み込みのエラーの帯に置く retry。サーバーで組み立てる部分を、画面を移らずに読み直す
export function RetryButton() {
  const router = useRouter();
  return (
    <Button variant="danger" onClick={() => router.refresh()}>
      retry
    </Button>
  );
}
