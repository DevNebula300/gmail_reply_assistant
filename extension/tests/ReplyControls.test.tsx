// extension/tests/ReplyControls.test.tsx
// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ReplyControls } from "../components/ReplyControls";
import { TONE_OPTIONS, LENGTH_OPTIONS } from "../src/lib/api-client";

describe("ReplyControls", () => {
  const defaultProps = {
    tone: "professional" as const,
    setTone: vi.fn(),
    length: "medium" as const,
    setLength: vi.fn(),
    instruction: "",
    setInstruction: vi.fn(),
    onGenerate: vi.fn(),
    loading: false,
    disabled: false,
  };

  it("renders all tone and length options aligned with OpenAPI enums", () => {
    render(<ReplyControls {...defaultProps} />);

    const toneSelect = screen.getByLabelText("Tone") as HTMLSelectElement;
    const lengthSelect = screen.getByLabelText("Length") as HTMLSelectElement;

    expect(toneSelect.children).toHaveLength(TONE_OPTIONS.length);
    TONE_OPTIONS.forEach((t) => {
      expect(screen.getByRole("option", { name: t.charAt(0).toUpperCase() + t.slice(1) })).toBeInTheDocument();
    });

    expect(lengthSelect.children).toHaveLength(LENGTH_OPTIONS.length);
    LENGTH_OPTIONS.forEach((l) => {
      expect(screen.getByRole("option", { name: l.charAt(0).toUpperCase() + l.slice(1) })).toBeInTheDocument();
    });
  });

  it("calls setTone, setLength, setInstruction when inputs change", () => {
    const setTone = vi.fn();
    const setLength = vi.fn();
    const setInstruction = vi.fn();

    render(
      <ReplyControls
        {...defaultProps}
        setTone={setTone}
        setLength={setLength}
        setInstruction={setInstruction}
      />
    );

    fireEvent.change(screen.getByLabelText("Tone"), { target: { value: "friendly" } });
    expect(setTone).toHaveBeenCalledWith("friendly");

    fireEvent.change(screen.getByLabelText("Length"), { target: { value: "short" } });
    expect(setLength).toHaveBeenCalledWith("short");

    fireEvent.change(screen.getByLabelText("Instruction"), { target: { value: "Decline politely" } });
    expect(setInstruction).toHaveBeenCalledWith("Decline politely");
  });

  it("disables all inputs and generate button when disabled is true", () => {
    render(
      <ReplyControls
        {...defaultProps}
        disabled={true}
        disabledReason="Please select an active email thread in Gmail."
      />
    );

    expect(screen.getByLabelText("Tone")).toBeDisabled();
    expect(screen.getByLabelText("Length")).toBeDisabled();
    expect(screen.getByLabelText("Instruction")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Generate 3 replies" })).toBeDisabled();
    expect(
      screen.getByText("Please select an active email thread in Gmail.")
    ).toBeInTheDocument();
  });

  it("disables inputs and shows loading text on button when loading is true", () => {
    render(<ReplyControls {...defaultProps} loading={true} />);

    expect(screen.getByLabelText("Tone")).toBeDisabled();
    expect(screen.getByLabelText("Length")).toBeDisabled();
    expect(screen.getByLabelText("Instruction")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Generating…" })).toBeDisabled();
  });

  it("calls onGenerate when Generate button is clicked", () => {
    const onGenerate = vi.fn();
    render(<ReplyControls {...defaultProps} onGenerate={onGenerate} />);

    fireEvent.click(screen.getByRole("button", { name: "Generate 3 replies" }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });
});
