// extension/tests/gmail.content.test.ts
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { extractThreadIdFromHash } from "../entrypoints/gmail.content";

describe("extractThreadIdFromHash", () => {
  it("returns null for empty or view-only hashes", () => {
    expect(extractThreadIdFromHash("")).toBeNull();
    expect(extractThreadIdFromHash("#")).toBeNull();
    expect(extractThreadIdFromHash("#inbox")).toBeNull();
    expect(extractThreadIdFromHash("#sent")).toBeNull();
    expect(extractThreadIdFromHash("#drafts")).toBeNull();
    expect(extractThreadIdFromHash("#all")).toBeNull();
    expect(extractThreadIdFromHash("#settings")).toBeNull();
  });

  it("extracts valid thread ID from standard inbox thread hash", () => {
    expect(extractThreadIdFromHash("#inbox/FMfcgzGvWzLpXmNq123456789")).toBe("FMfcgzGvWzLpXmNq123456789");
  });

  it("extracts valid thread ID from category/label thread hash", () => {
    expect(extractThreadIdFromHash("#label/Work/FMfcgzGvWzLpXmNq123456789")).toBe(
      "FMfcgzGvWzLpXmNq123456789",
    );
    expect(extractThreadIdFromHash("#search/query/FMfcgzGvWzLpXmNq123456789")).toBe(
      "FMfcgzGvWzLpXmNq123456789",
    );
  });

  it("extracts valid 16-character legacy hex thread ID", () => {
    expect(extractThreadIdFromHash("#inbox/17e5a8f4c20b9e81")).toBe("17e5a8f4c20b9e81");
  });
});
