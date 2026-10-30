import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ErrorBoundary from "./ErrorBoundary";

afterEach(cleanup);

const Boom = () => {
  throw new Error("broken screen");
};

describe("ErrorBoundary", () => {
  it("shows a friendly message instead of a blank page", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
  });

  it("renders children normally", () => {
    render(
      <ErrorBoundary>
        <p>all fine</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("all fine")).toBeInTheDocument();
  });
});
