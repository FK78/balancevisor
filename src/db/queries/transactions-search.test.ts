import { beforeAll, describe, expect, it, vi } from "vitest";

let filterSearchRows: typeof import("@/db/queries/transactions").filterSearchRows;

describe("filterSearchRows", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost/test";
    ({ filterSearchRows } = await import("@/db/queries/transactions"));
  });

  it("avoids decrypting rows whose category already matches the search", async () => {
    const rows = [
      {
        id: "category-match",
        category: "Groceries",
        description: "encrypted-1",
        accountName: "encrypted-a",
        type: "expense" as const,
        amount: 25,
      },
      {
        id: "encrypted-match",
        category: "Bills",
        description: "encrypted-2",
        accountName: "encrypted-b",
        type: "expense" as const,
        amount: 40,
      },
    ];

    type TestRow = (typeof rows)[number];

    const decryptRows = vi.fn(async (rowsToDecrypt: TestRow[]) =>
      rowsToDecrypt.map((row) => ({
        ...row,
        description: row.id === "encrypted-match" ? "Tesco purchase" : "Other",
        accountName: "Main account",
      })),
    );

    const filtered = await filterSearchRows(rows, "gro", decryptRows);

    expect(filtered.map((row) => row.id)).toEqual(["category-match"]);
    expect(decryptRows).toHaveBeenCalledTimes(1);
    expect(decryptRows).toHaveBeenCalledWith([
      expect.objectContaining({ id: "encrypted-match" }),
    ]);
  });
});
