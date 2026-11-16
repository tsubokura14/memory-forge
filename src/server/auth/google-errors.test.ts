import { describe, expect, test } from "vitest";
import { signInErrorFromGoogle } from "./google-errors";

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
