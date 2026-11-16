import { auth } from "@/server/auth/auth";

// Google からの戻り先（docs/design.md の「Better Auth の HTTP の入口は戻り先の1本だけ」）
export async function GET(request: Request) {
  return auth.handler(request);
}
