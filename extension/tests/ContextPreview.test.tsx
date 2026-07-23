// extension/tests/ContextPreview.test.tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ContextPreview } from "../components/ContextPreview";
import { ThreadContext } from "../src/lib/api-client";

const MOCK_CONTEXT: ThreadContext = {
  thread_id: "thread_123",
  subject: "Q3 Planning & Roadmap",
  participants: ["alice@example.com", "bob@example.com"],
  messages: [
    {
      id: "msg_1",
      from: "alice@example.com",
      date: "2026-07-24T10:00:00Z",
      body: "Can we schedule a meeting to review Q3 roadmap?",
    },
  ],
  fingerprint: "fp_987654321",
};

describe("ContextPreview", () => {
  it("renders empty state when context is null and not loading", () => {
    render(<ContextPreview context={null} loading={false} error={null} />);
    expect(screen.getByText("No active thread selected")).toBeInTheDocument();
    expect(
      screen.getByText(/Open or select an email thread in Gmail/i),
    ).toBeInTheDocument();
  });

  it("renders loading state when loading is true", () => {
    render(<ContextPreview context={null} loading={true} error={null} />);
    expect(screen.getByText("Fetching thread context…")).toBeInTheDocument();
  });

  it("renders error state when error message is present", () => {
    render(<ContextPreview context={null} loading={false} error="Failed to load thread" />);
    expect(screen.getByText("Failed to load thread")).toBeInTheDocument();
  });

  it("renders thread context details, subject, participants, and messages", () => {
    render(<ContextPreview context={MOCK_CONTEXT} loading={false} error={null} />);
    expect(screen.getByText("Q3 Planning & Roadmap")).toBeInTheDocument();
    expect(screen.getAllByText("alice@example.com").length).toBeGreaterThan(0);
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    expect(screen.getByText("Can we schedule a meeting to review Q3 roadmap?")).toBeInTheDocument();
  });
});
