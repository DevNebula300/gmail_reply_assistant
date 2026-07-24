// extension/tests/SuggestionList.test.tsx
// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SuggestionList } from "../components/SuggestionList";
import { ReplySuggestion } from "../src/lib/api-client";

const mockSuggestions: ReplySuggestion[] = [
  { id: "s1", text: "Suggestion 1 text" },
  {
    id: "s2",
    text: "Suggestion 2 text",
    warnings: [{ code: "date", message: "Mentions an unverified date commitment." }],
  },
  { id: "s3", text: "Suggestion 3 text" },
];

describe("SuggestionList", () => {
  it("renders empty state placeholder when no suggestions are available", () => {
    render(<SuggestionList suggestions={[]} onSelect={vi.fn()} />);

    expect(screen.getByText("Generate replies to see suggestions here.")).toBeInTheDocument();
  });

  it("renders 3 suggestions with Option labels and safety warnings", () => {
    render(<SuggestionList suggestions={mockSuggestions} onSelect={vi.fn()} />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();

    expect(screen.getByText("Suggestion 1 text")).toBeInTheDocument();
    expect(screen.getByText("Suggestion 2 text")).toBeInTheDocument();
    expect(screen.getByText("Suggestion 3 text")).toBeInTheDocument();

    expect(screen.getByText("Mentions an unverified date commitment.")).toBeInTheDocument();
  });

  it("calls onSelect when Use this button is clicked", () => {
    const onSelect = vi.fn();
    render(<SuggestionList suggestions={mockSuggestions} onSelect={onSelect} />);

    const buttons = screen.getAllByRole("button", { name: "Use this" });
    fireEvent.click(buttons[1]);

    expect(onSelect).toHaveBeenCalledWith(mockSuggestions[1]);
  });

  it("highlights selected suggestion and shows Selected badge", () => {
    render(
      <SuggestionList
        suggestions={mockSuggestions}
        selectedText="Suggestion 2 text"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Selected" })).toBeInTheDocument();
  });

  it("renders Regenerate button and triggers callback when clicked", () => {
    const onRegenerate = vi.fn();
    render(
      <SuggestionList
        suggestions={mockSuggestions}
        onSelect={vi.fn()}
        onRegenerate={onRegenerate}
      />
    );

    const regenBtn = screen.getByRole("button", { name: "Regenerate suggestions" });
    expect(regenBtn).toBeInTheDocument();
    fireEvent.click(regenBtn);

    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it("disables Regenerate button while loading", () => {
    render(
      <SuggestionList
        suggestions={mockSuggestions}
        onSelect={vi.fn()}
        onRegenerate={vi.fn()}
        loading={true}
      />
    );

    const regenBtn = screen.getByRole("button", { name: "Regenerate suggestions" });
    expect(regenBtn).toBeDisabled();
    expect(regenBtn).toHaveTextContent("Regenerating…");
  });
});
