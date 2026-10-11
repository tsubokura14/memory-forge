import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // next dev が AGENTS.md を作らないようにする。AI へのルールは CLAUDE.md にまとめている
  agentRules: false,
};

export default nextConfig;
