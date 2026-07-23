// extension/tests/SidePanelApp.test.tsx
// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SidePanelApp } from "../components/SidePanelApp";
import * as useAssistantHooks from "../src/hooks/useAssistant";

vi.mock("../src/hooks/useAssistant", () => ({
  useSession: vi.fn(),
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
  it("renders the connected side panel view when authenticated", () => {
    vi.mocked(useAssistantHooks.useSession).mockReturnValue({
      session: { user_id: "u1", email: "test@example.com", gmail_connected: true, display_name: "Test User" },
      loading: false,
      connecting: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(<SidePanelApp />);
    expect(screen.getByText("Gmail Reply Assistant")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeInTheDocument();
  });

  it("renders the Connect Gmail screen when disconnected", () => {
    vi.mocked(useAssistantHooks.useSession).mockReturnValue({
      session: null,
      loading: false,
      connecting: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(<SidePanelApp />);
    expect(screen.getByRole("heading", { name: "Connect Gmail" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect Gmail Account" })).toBeInTheDocument();
  });
});