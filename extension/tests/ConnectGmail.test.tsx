// extension/tests/ConnectGmail.test.tsx
// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ConnectGmail } from "../components/ConnectGmail";

describe("ConnectGmail", () => {
  it("renders the connect screen with title, features, and button", () => {
    render(<ConnectGmail onConnect={vi.fn()} connecting={false} />);

    expect(screen.getByRole("heading", { name: "Connect Gmail" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect Gmail Account" })).toBeInTheDocument();
    expect(
      screen.getByText("Reads email threads only when open to generate context-aware replies"),
    ).toBeInTheDocument();
  });

  it("calls onConnect when button is clicked", () => {
    const handleConnect = vi.fn();
    render(<ConnectGmail onConnect={handleConnect} connecting={false} />);

    const button = screen.getByRole("button", { name: "Connect Gmail Account" });
    fireEvent.click(button);

    expect(handleConnect).toHaveBeenCalledTimes(1);
  });

  it("shows connecting state when connecting is true", () => {
    render(<ConnectGmail onConnect={vi.fn()} connecting={true} />);

    expect(screen.getByText("Connecting to Google…")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("displays error message when error prop is provided", () => {
    render(
      <ConnectGmail
        onConnect={vi.fn()}
        connecting={false}
        error="OAuth flow cancelled by user"
      />,
    );

    expect(screen.getByText("OAuth flow cancelled by user")).toBeInTheDocument();
  });
});
