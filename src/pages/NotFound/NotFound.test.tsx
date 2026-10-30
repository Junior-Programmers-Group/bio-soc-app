import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import NotFound from "./NotFound";

// jsdom has no matchMedia: pretend to be a desktop screen
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("NotFound", () => {
  it("says what happened, shows the address and offers ways back", () => {
    render(
      <MemoryRouter initialEntries={["/discover/plants/oops"]}>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /couldn.t find that page/i })).toBeInTheDocument();
    expect(screen.getByText("/discover/plants/oops")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Discover plants/ })).toHaveAttribute("href", "/discover");
    expect(screen.getByRole("link", { name: /Scan a tag/ })).toHaveAttribute("href", "/scan");
    expect(screen.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
  });
});
