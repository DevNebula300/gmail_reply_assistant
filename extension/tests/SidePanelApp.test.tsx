// extension/tests/SidePanelApp.test.tsx
// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SidePanelApp } from "../components/SidePanelApp";

vi.mock("../src/hooks/useAssistant", () => ({
  useSession: () => ({
    session: { email: "test@example.com", gmail_connected: true },
    loading: false,
    error: null,
  }),
  useActiveThread: () => "thread_mock_001",
  useThreadContext: () => ({
    context: {
      thread_id: "thread_mock_001",
      subject: "Project timeline follow-up",
      participants: ["alex@example.com", "you@example.com"],
      messages: [
        {
          id: "msg_001",
          from: "alex@example.com",
          date: "2026-07-18T14:30:00Z",
          body: "Hi, just checking whether we can confirm the delivery date for phase 1.",
        },
      ],
      fingerprint: "fp_test",
    },
    loading: false,
    error: null,
  }),
  useGenerateReplies: () => ({
    tone: "professional",
    setTone: vi.fn(),
    length: "medium",
    setLength: vi.fn(),
    instruction: "",
    setInstruction: vi.fn(),
    result: null,
    loading: false,
    error: null,
    generate: vi.fn(),
  }),
}));

describe("SidePanelApp", () => {
  it("renders the side panel heading and account info", () => {
    render(<SidePanelApp />);
    expect(screen.getByText("Gmail Reply Assistant")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});