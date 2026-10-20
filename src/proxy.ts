import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";

// ログインしていなくても開ける画面（docs/design.md の「ログインの確かめ」）
const PUBLIC_PATHS = new Set(["/login"]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { session, headers } = await getSession(request.headers);

  if (PUBLIC_PATHS.has(pathname)) {
    if (session && request.method === "GET") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  const response = NextResponse.next();
  // 期限を延ばしたときの cookie を、ブラウザに返す
  for (const cookie of headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  // sign out したあと、ブラウザの戻るで、前の画面を保存したものから出さないようにする
  response.headers.set("cache-control", "private, no-store");
  return response;
}

export const config = {
  // Next.js が配るファイル（JavaScript、CSS、書体）には動かさない
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
