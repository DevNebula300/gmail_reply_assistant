// extension/tests/SidePanelApp.test.tsx
// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SidePanelApp } from "../components/SidePanelApp";
import * as useAssistantHooks from "../src/hooks/useAssistant";

vi.mock("../src/hooks/useAssistant", () => ({
  useSession: vi.fn(),
  useActiveThread: vi.fn(() => "thread_mock_001"),
  useThreadContext: vi.fn(() => ({
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
    refresh: vi.fn(),
  })),
  useGenerateReplies: vi.fn(() => ({
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
  })),
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
    expect(screen.getByRole("heading", { name: "Generate replies" })).toBeInTheDocument();
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

  it("disables generate button and shows disabled message if fingerprint is missing", () => {
    vi.mocked(useAssistantHooks.useSession).mockReturnValue({
      session: { user_id: "u1", email: "test@example.com", gmail_connected: true },
      loading: false,
      connecting: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useAssistantHooks.useThreadContext).mockReturnValue({
      context: {
        thread_id: "thread_mock_001",
        subject: "Test",
        participants: [],
        messages: [],
        fingerprint: undefined,
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<SidePanelApp />);
    expect(screen.getByRole("button", { name: "Generate 3 replies" })).toBeDisabled();
    expect(
      screen.getByText(/Thread context fingerprint missing/i)
    ).toBeInTheDocument();
  });

  it("renders suggestions and updates selected draft when suggestion is clicked", () => {
    vi.mocked(useAssistantHooks.useSession).mockReturnValue({
      session: { user_id: "u1", email: "test@example.com", gmail_connected: true },
      loading: false,
      connecting: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useAssistantHooks.useGenerateReplies).mockReturnValue({
      tone: "professional",
      setTone: vi.fn(),
      length: "medium",
      setLength: vi.fn(),
      instruction: "",
      setInstruction: vi.fn(),
      result: {
        request_id: "req_1",
        suggestions: [
          { id: "s1", text: "Reply option 1 text" },
          { id: "s2", text: "Reply option 2 text" },
          { id: "s3", text: "Reply option 3 text" },
        ],
      },
      loading: false,
      error: null,
      generate: vi.fn(),
    });

    render(<SidePanelApp />);
    expect(screen.getByText("Reply option 1 text")).toBeInTheDocument();

    const useThisButtons = screen.getAllByRole("button", { name: "Use this" });
    fireEvent.click(useThisButtons[0]);

    expect(screen.getByRole("heading", { name: "Selected draft" })).toBeInTheDocument();
    expect(screen.getAllByText("Reply option 1 text").length).toBeGreaterThanOrEqual(2);
  });

  it("displays ErrorState component when generation produces an error", () => {
    vi.mocked(useAssistantHooks.useSession).mockReturnValue({
      session: { user_id: "u1", email: "test@example.com", gmail_connected: true },
      loading: false,
      connecting: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useAssistantHooks.useGenerateReplies).mockReturnValue({
      tone: "professional",
      setTone: vi.fn(),
      length: "medium",
      setLength: vi.fn(),
      instruction: "",
      setInstruction: vi.fn(),
      result: null,
      loading: false,
      error: "Rate limit exceeded. Please wait a minute.",
      generate: vi.fn(),
    });

    render(<SidePanelApp />);
    expect(screen.getByText("Rate limit exceeded. Please wait a minute.")).toBeInTheDocument();
  });
});
