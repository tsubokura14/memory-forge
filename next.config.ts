import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // next dev が AGENTS.md を作らないようにする。AI へのルールは CLAUDE.md にまとめている
  agentRules: false,
  experimental: {
    // 取り込む問題のファイル（4MB まで）を、サーバーアクションで送るため。既定は 1MB。
    // 送るときの区切りの文字の分を足して 4.5MB にする。Vercel の関数が受け取れる上限（4.5MB）は超えない
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

export default nextConfig;
