import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import { createUser } from "../../../scripts/insert-user";
import { db } from "@/server/db/client";
import { account, user } from "@/server/db/schema";
import { listGoogleAccounts, splitGoogleAccounts } from "./google-accounts";

// Google の ID トークンと同じ形（ヘッダー.中身.署名）。中身の email だけを使う
function fakeIdToken(email: string) {
  const part = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "RS256" })}.${part({ email, sub: randomUUID() })}.sig`;
}

async function userId(email: string) {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));
  return row.id;
}

async function linkGoogle(ownerId: string, email: string, createdAt: Date) {
  await db.insert(account).values({
    id: randomUUID(),
    accountId: randomUUID(),
    providerId: "google",
    userId: ownerId,
    idToken: fakeIdToken(email),
    createdAt,
    updatedAt: createdAt,
  });
}

beforeEach(async () => {
  // account は user を消すと一緒に消える
  await db.delete(user);
  await createUser(db, { email: "me@example.com", password: "password-1" });
  // createUser はアカウントを1つにそろえるので、ほかの人の行は直接入れる
  await db.insert(user).values({
    id: randomUUID(),
    name: "",
    email: "other@example.com",
    emailVerified: true,
    updatedAt: new Date(),
  });
});

describe("listGoogleAccounts", () => {
  test("自分の Google の行だけを、紐づけた順に、ID トークンのメールアドレスで返す", async () => {
    const me = await userId("me@example.com");
    const other = await userId("other@example.com");
    await linkGoogle(me, "me.work@gmail.com", new Date("2026-11-02T00:00:00Z"));
    await linkGoogle(me, "me@gmail.com", new Date("2026-11-01T00:00:00Z"));
    await linkGoogle(
      other,
      "other@gmail.com",
      new Date("2026-11-01T00:00:00Z"),
    );

    const accounts = await listGoogleAccounts(me);

    // パスワードの行（credential）とほかの人の行は入らない
    expect(accounts.map((a) => a.email)).toEqual([
      "me@gmail.com",
      "me.work@gmail.com",
    ]);
  });

  test("紐づけていなければ、空の一覧", async () => {
    expect(await listGoogleAccounts(await userId("me@example.com"))).toEqual(
      [],
    );
  });
});

describe("splitGoogleAccounts", () => {
  test("自分の Google アカウントの行は、足したものに入れず、足したものは並びのまま残す", () => {
    const accounts = [
      { id: "1", email: "me.work@gmail.com" },
      { id: "2", email: "Me@Gmail.com" },
      { id: "3", email: "me.side@gmail.com" },
    ];

    expect(splitGoogleAccounts("me@gmail.com", accounts)).toEqual({
      owner: "me@gmail.com",
      added: [
        { id: "1", email: "me.work@gmail.com" },
        { id: "3", email: "me.side@gmail.com" },
      ],
    });
  });

  test("自分の Google の行がまだなくても、自分のメールアドレスを返す", () => {
    expect(splitGoogleAccounts("me@gmail.com", [])).toEqual({
      owner: "me@gmail.com",
      added: [],
    });
  });
});
