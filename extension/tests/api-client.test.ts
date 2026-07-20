import { describe, expect, it } from "vitest";
import { api } from "../src/lib/api-client";

describe("api client mock mode", () => {
  it("returns three suggestions from mock generate", async () => {
    const result = await api.generateReplies({
      thread_id: "thread_test",
      tone: "professional",
      length: "medium",
    });

    expect(result.suggestions).toHaveLength(3);
  });
});
