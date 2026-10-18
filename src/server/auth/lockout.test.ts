import { describe, expect, test } from "vitest";
import { isLocked, lockedUntilFrom } from "./lockout";

const start = new Date("2026-10-18T00:00:00Z");
const until = lockedUntilFrom(start);

describe("isLocked", () => {
  test("15分の直前までは止めている", () => {
    expect(isLocked(until, new Date(start.getTime() + 15 * 60_000 - 1))).toBe(
      true,
    );
  });

  test("15分たったら止めない", () => {
    expect(isLocked(until, new Date(start.getTime() + 15 * 60_000))).toBe(
      false,
    );
  });

  test("期限がなければ止めない", () => {
    expect(isLocked(null, start)).toBe(false);
  });
});
