// 続けて間違えたら止める決まり（DB を使わない計算）
export const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60_000;

// 止める期限。MAX_FAILURES 回目に間違えた時刻から15分
export function lockedUntilFrom(now: Date): Date {
  return new Date(now.getTime() + LOCK_MS);
}

export function isLocked(lockedUntil: Date | null, now: Date): boolean {
  return lockedUntil !== null && now < lockedUntil;
}
