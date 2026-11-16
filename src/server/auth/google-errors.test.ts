import { describe, expect, test } from "vitest";
import { linkErrorFromGoogle, signInErrorFromGoogle } from "./google-errors";

describe("linkErrorFromGoogle", () => {
  test("Google の画面でキャンセルしたときは、何も出さない", () => {
    expect(linkErrorFromGoogle("access_denied")).toBe(false);
  });

  test("そのほかのエラーは、紐づけの失敗を出す", () => {
    expect(linkErrorFromGoogle("invalid_code")).toBe(true);
  });

  test("エラーがなければ、何も出さない", () => {
    expect(linkErrorFromGoogle(undefined)).toBe(false);
  });
});

describe("signInErrorFromGoogle", () => {
  test("Google の画面でキャンセルしたときは、何も出さない", () => {
    expect(signInErrorFromGoogle("access_denied")).toBeNull();
  });

  test("紐づけていない Google アカウントは notLinked になる", () => {
    expect(signInErrorFromGoogle("signup_disabled")).toBe("notLinked");
    expect(signInErrorFromGoogle("account_not_linked")).toBe("notLinked");
  });

  test("そのほかのエラーは error になる", () => {
    expect(signInErrorFromGoogle("invalid_code")).toBe("error");
  });

  test("エラーがなければ、何も出さない", () => {
    expect(signInErrorFromGoogle(undefined)).toBeNull();
  });
});
