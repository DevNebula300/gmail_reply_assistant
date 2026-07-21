// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { OptionsPage } from "../components/OptionsPage";

describe("OptionsPage", () => {
  it("renders default tone and length selects", () => {
    render(<OptionsPage />);
    expect(screen.getByText("Default tone")).toBeInTheDocument();
    expect(screen.getByText("Default length")).toBeInTheDocument();
  });

  it("updates greeting field on input", () => {
    render(<OptionsPage />);
    const greetingInput = screen.getByPlaceholderText('e.g. "Hi [Name],"');
    fireEvent.change(greetingInput, { target: { value: "Hello there," } });
    expect(greetingInput).toHaveValue("Hello there,");
  });

  it("shows saved confirmation after clicking save", () => {
    render(<OptionsPage />);
    const saveButton = screen.getByRole("button", { name: /save preferences/i });
    fireEvent.click(saveButton);
    expect(screen.getByText(/saved locally/i)).toBeInTheDocument();
  });

  it("resets saved confirmation when a field changes after saving", () => {
    render(<OptionsPage />);
    const saveButton = screen.getByRole("button", { name: /save preferences/i });
    fireEvent.click(saveButton);
    expect(screen.getByText(/saved locally/i)).toBeInTheDocument();

    const signOffInput = screen.getByPlaceholderText('e.g. "Best regards,"');
    fireEvent.change(signOffInput, { target: { value: "Cheers," } });
    expect(screen.queryByText(/saved locally/i)).not.toBeInTheDocument();
  });
});
