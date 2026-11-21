import { describe, expect, test } from "vitest";
import { collectWorkspaceIds } from "./workspace";

function content(subject: unknown, ids: unknown[]) {
  return JSON.stringify({
    subject,
    questions: ids.map((id) => ({ id, topic: "Decorators" })),
  });
}

describe("collectWorkspaceIds", () => {
  test("同じ Subject のほかのファイルの ID を、ファイル名と集める", () => {
    const ids = collectWorkspaceIds(
      [
        {
          path: "/q/python.json",
          name: "python.json",
          content: content("Python", ["a1", "b2"]),
        },
        {
          path: "/q/aws.json",
          name: "aws.json",
          content: content("AWS", ["c3"]),
        },
      ],
      "Python",
      "/q/new.json",
    );
    expect(ids).toEqual(
      new Map([
        ["a1", "python.json"],
        ["b2", "python.json"],
      ]),
    );
  });

  test("確かめるファイル自身は除く", () => {
    const ids = collectWorkspaceIds(
      [
        {
          path: "/q/python.json",
          name: "python.json",
          content: content("Python", ["a1"]),
        },
      ],
      "Python",
      "/q/python.json",
    );
    expect(ids.size).toBe(0);
  });

  test("JSON として読めないファイルと、subject が文字でないファイルは飛ばす", () => {
    const ids = collectWorkspaceIds(
      [
        { path: "/q/broken.json", name: "broken.json", content: "{ subject:" },
        { path: "/q/odd.json", name: "odd.json", content: content(1, ["a1"]) },
        {
          path: "/q/ok.json",
          name: "ok.json",
          content: content("Python", ["b2"]),
        },
      ],
      "Python",
      "/q/new.json",
    );
    expect(ids).toEqual(new Map([["b2", "ok.json"]]));
  });
});
