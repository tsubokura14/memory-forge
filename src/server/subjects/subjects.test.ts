import { beforeEach, describe, expect, test } from "vitest";
import { db } from "@/server/db/client";
import { subjects } from "@/server/db/schema";
import { listSubjects } from "./subjects";

beforeEach(async () => {
  await db.delete(subjects);
});

describe("listSubjects", () => {
  test("Subject を取り込んだ順に返す", async () => {
    const rows = await db
      .insert(subjects)
      .values([{ name: "Python" }, { name: "AWS SAA" }, { name: "Linux" }])
      .returning({ id: subjects.id });

    expect(await listSubjects()).toEqual([
      { id: rows[0].id, name: "Python" },
      { id: rows[1].id, name: "AWS SAA" },
      { id: rows[2].id, name: "Linux" },
    ]);
  });

  test("Subject がないときは空", async () => {
    expect(await listSubjects()).toEqual([]);
  });
});
