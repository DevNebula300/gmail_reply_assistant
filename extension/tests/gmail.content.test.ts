// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import {
  extractThreadIdFromHash,
  parseThreadId,
  getThreadIdFromLocationAndDom,
} from "../entrypoints/gmail.content";

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

describe("parseThreadId", () => {
  it("parses legacy thread ID", () => {
    expect(parseThreadId("19f9223c7faf5ce6")).toBe("19f9223c7faf5ce6");
  });

  it("extracts numeric portion from #thread-f format", () => {
    expect(parseThreadId("#thread-f:1871564763384732902")).toBe("1871564763384732902");
  });

  it("extracts numeric portion from other prefixes (#thread-a: or thread-f:)", () => {
    expect(parseThreadId("#thread-a:1871564763384732902")).toBe("1871564763384732902");
    expect(parseThreadId("thread-f:1871564763384732902")).toBe("1871564763384732902");
  });

  it("parses standard Gmail alphanumeric IDs", () => {
    expect(parseThreadId("FMfcgzGvWzLpXmNq123456789")).toBe("FMfcgzGvWzLpXmNq123456789");
  });

  it("returns null for invalid or empty values", () => {
    expect(parseThreadId("invalid")).toBeNull();
    expect(parseThreadId("")).toBeNull();
    expect(parseThreadId(null)).toBeNull();
    expect(parseThreadId(undefined)).toBeNull();
  });
});

describe("getThreadIdFromLocationAndDom", () => {
  beforeEach(() => {
    window.location.hash = "#inbox";
    document.body.innerHTML = "";
  });

  it("prefers location hash if hash contains valid thread ID", () => {
    window.location.hash = "#inbox/FMfcgzGvWzLpXmNq123456789";
    document.body.innerHTML = '<span data-thread-id="#thread-f:9999999999999999999"></span>';
    expect(getThreadIdFromLocationAndDom()).toBe("FMfcgzGvWzLpXmNq123456789");
  });

  it("prefers active conversation subject header (h2) over inbox table rows (tr.zA)", () => {
    document.body.innerHTML = `
      <table>
        <tr class="zA" data-legacy-thread-id="inbox_row_thread_1"><td>Row 1</td></tr>
        <tr class="zA" data-legacy-thread-id="inbox_row_thread_2"><td>Row 2</td></tr>
      </table>
      <div role="main">
        <h2 class="hP" data-legacy-thread-id="active_open_thread_99">Subject Title</h2>
      </div>
    `;
    expect(getThreadIdFromLocationAndDom()).toBe("active_open_thread_99");
  });

  it("prefers data-legacy-thread-id when both attributes exist", () => {
    document.body.innerHTML = `
      <h2
        data-thread-id="#thread-f:1871564763384732902"
        data-legacy-thread-id="19f9223c7faf5ce6">
      </h2>
    `;
    expect(getThreadIdFromLocationAndDom()).toBe("19f9223c7faf5ce6");
  });

  it("falls back to data-thread-id when data-legacy-thread-id is absent", () => {
    document.body.innerHTML = `
      <h2 data-thread-id="#thread-f:1871564763384732902"></h2>
    `;
    expect(getThreadIdFromLocationAndDom()).toBe("1871564763384732902");
  });

  it("returns null when no valid thread attributes are found in DOM", () => {
    document.body.innerHTML = '<span data-thread-id="short"></span>';
    expect(getThreadIdFromLocationAndDom()).toBeNull();
  });
});

