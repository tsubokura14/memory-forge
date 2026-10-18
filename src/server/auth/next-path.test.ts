import { describe, expect, test } from "vitest";
import { nextPath } from "./next-path";

describe("nextPath", () => {
  test("/ で始まるアプリの中のパスは、そのまま移る先になる", () => {
    expect(nextPath("/missing?tab=1")).toBe("/missing?tab=1");
  });

  test("よそのサイトを指すものは / になる", () => {
    expect(nextPath("//example.com")).toBe("/");
    expect(nextPath("/\\example.com")).toBe("/");
    expect(nextPath("https://example.com")).toBe("/");
  });

  test("渡されなかったときは / になる", () => {
    expect(nextPath(null)).toBe("/");
  });
});
