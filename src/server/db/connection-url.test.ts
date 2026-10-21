import { describe, expect, test } from "vitest";
import { withVerifyFull } from "./connection-url";

const BASE = "postgresql://user:p%40ss@ep-example.neon.tech/neondb";

describe("withVerifyFull", () => {
  test("sslmode があれば verify-full に置き換え、ほかの値は残す", () => {
    const url = new URL(
      withVerifyFull(`${BASE}?sslmode=require&channel_binding=require`)!,
    );
    expect(url.searchParams.get("sslmode")).toBe("verify-full");
    expect(url.searchParams.get("channel_binding")).toBe("require");
    expect(url.username).toBe("user");
    expect(url.password).toBe("p%40ss");
    expect(url.host).toBe("ep-example.neon.tech");
    expect(url.pathname).toBe("/neondb");
  });

  test("sslmode がなければ verify-full を足す", () => {
    const url = new URL(withVerifyFull(BASE)!);
    expect(url.searchParams.get("sslmode")).toBe("verify-full");
  });

  test("空やないときは、そのまま返す", () => {
    expect(withVerifyFull("")).toBe("");
    expect(withVerifyFull(undefined)).toBeUndefined();
  });
});
