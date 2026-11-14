import { afterEach, describe, expect, test, vi } from "vitest";
import { now } from "./clock";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("now", () => {
  test("FIXED_NOW があれば、その日時を返す", () => {
    vi.stubEnv("FIXED_NOW", "2026-01-15T09:00:00+09:00");
    expect(now()).toEqual(new Date("2026-01-15T09:00:00+09:00"));
  });

  test("FIXED_NOW がなければ、今の日時を返す", () => {
    vi.stubEnv("FIXED_NOW", undefined);
    vi.useFakeTimers({ now: new Date("2026-03-01T12:00:00Z") });
    expect(now()).toEqual(new Date("2026-03-01T12:00:00Z"));
  });
});
