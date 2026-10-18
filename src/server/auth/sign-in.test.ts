import { beforeEach, describe, expect, test } from "vitest";
import { createUser } from "../../../scripts/create-user";
import { db } from "@/server/db/client";
import { signInAttempts, user } from "@/server/db/schema";
import { signIn } from "./sign-in";

const EMAIL = "me@example.com";
const PASSWORD = "correct-password";
const WRONG = "wrong-password";

const start = new Date("2026-10-18T00:00:00Z");
const minutesLater = (minutes: number) =>
  new Date(start.getTime() + minutes * 60_000);

async function failTimes(times: number, now: Date, email = EMAIL) {
  for (let i = 0; i < times; i++) {
    await signIn({ email, password: WRONG }, now);
  }
}

beforeEach(async () => {
  await db.delete(signInAttempts);
  // session と account は user を消すと一緒に消える
  await db.delete(user);
  await createUser(db, { email: EMAIL, password: PASSWORD });
});

// パスワードを確かめるたびに scrypt のハッシュを作り、CI では1回1秒近くかかる。何度も間違えるテストが既定の5秒に収まらないため延ばす
describe("signIn", { timeout: 30_000 }, () => {
  test("正しいメールアドレスとパスワードなら ok", async () => {
    expect(await signIn({ email: EMAIL, password: PASSWORD }, start)).toBe(
      "ok",
    );
  });

  test("メールアドレスの大文字と前後の空白は、除いて同じに扱う", async () => {
    expect(
      await signIn({ email: " Me@Example.com ", password: PASSWORD }, start),
    ).toBe("ok");

    await failTimes(4, start, " ME@example.com");
    expect(await signIn({ email: EMAIL, password: WRONG }, start)).toBe(
      "locked",
    );
  });

  test("メールアドレスが違っても、パスワードが違っても incorrect", async () => {
    expect(
      await signIn({ email: "other@example.com", password: PASSWORD }, start),
    ).toBe("incorrect");
    expect(await signIn({ email: EMAIL, password: WRONG }, start)).toBe(
      "incorrect",
    );
  });

  test("メールアドレスの形でないものも incorrect", async () => {
    expect(
      await signIn({ email: "not-an-email", password: WRONG }, start),
    ).toBe("incorrect");
  });

  test("4回目までの間違いは incorrect、5回目から locked", async () => {
    await failTimes(3, start);
    expect(await signIn({ email: EMAIL, password: WRONG }, start)).toBe(
      "incorrect",
    );
    expect(await signIn({ email: EMAIL, password: WRONG }, start)).toBe(
      "locked",
    );
  });

  test("止めている間は、正しいパスワードでも locked", async () => {
    await failTimes(5, start);
    expect(
      await signIn({ email: EMAIL, password: PASSWORD }, minutesLater(14)),
    ).toBe("locked");
  });

  test("止めている間に試しても延びず、15分たてば入れる", async () => {
    await failTimes(5, start);
    await signIn({ email: EMAIL, password: WRONG }, minutesLater(10));
    expect(
      await signIn({ email: EMAIL, password: PASSWORD }, minutesLater(15)),
    ).toBe("ok");
  });

  test("期限が過ぎたあとは0から数え直し、1回の間違いでは止まらない", async () => {
    await failTimes(5, start);
    expect(
      await signIn({ email: EMAIL, password: WRONG }, minutesLater(15)),
    ).toBe("incorrect");
  });

  test("入れたら回数は0に戻り、そのあと4回間違えても止まらない", async () => {
    await failTimes(4, start);
    await signIn({ email: EMAIL, password: PASSWORD }, start);
    await failTimes(3, start);
    expect(await signIn({ email: EMAIL, password: WRONG }, start)).toBe(
      "incorrect",
    );
  });

  test("登録されていないメールアドレスも、5回続けて間違えると locked", async () => {
    await failTimes(4, start, "stranger@example.com");
    expect(
      await signIn({ email: "stranger@example.com", password: WRONG }, start),
    ).toBe("locked");
  });
});
