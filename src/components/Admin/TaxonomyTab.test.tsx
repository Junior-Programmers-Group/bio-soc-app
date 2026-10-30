import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { TaxonomyData } from "../../back-end/hooks/useFetchTaxonomy";
import TaxonomyTab from "./TaxonomyTab";

afterEach(cleanup);

const taxonomy = {
  domain: [{ id: "d1", name: "Eukaryota", description: "x" }],
  kingdom: [],
  phylum: [],
  class: [],
  order: [],
  family: [{ id: "f1", name: "Fabaceae", description: "legumes", order: "o1" }],
  genus: [],
} as unknown as TaxonomyData;

const setup = () => {
  const create = vi.fn().mockResolvedValue(undefined);
  const onCreated = vi.fn().mockResolvedValue(undefined);
  const notify = vi.fn();
  render(<TaxonomyTab taxonomy={taxonomy} isMobile={false} create={create} onCreated={onCreated} notify={notify} />);
  return { create, onCreated, notify };
};

describe("taxonomy create", () => {
  it("posts name, description and the parent id to the rank's own collection", async () => {
    const { create, notify } = setup();
    // Genus is selected first, and belongs to a family
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "f1" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. Pterocarpus"), { target: { value: "  Pterocarpus " } });
    fireEvent.change(screen.getByPlaceholderText("A short description of this genus"), { target: { value: " A genus. " } });
    fireEvent.click(screen.getByRole("button", { name: "Create Genus" }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create).toHaveBeenCalledWith("genus", { name: "Pterocarpus", description: "A genus.", family: "f1" });
    await waitFor(() => expect(notify).toHaveBeenCalledWith("success", "Genus created", "Pterocarpus was added to the classification."));
  });

  it("adds the optional date for a Domain", async () => {
    const { create } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Domain/ }));
    fireEvent.change(screen.getByPlaceholderText("e.g. Eukarya"), { target: { value: "Bacteria" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 1836"), { target: { value: "1830" } });
    fireEvent.change(screen.getByPlaceholderText("A short description of this domain"), { target: { value: "Prokaryotes." } });
    fireEvent.click(screen.getByRole("button", { name: "Create Domain" }));

    await waitFor(() => expect(create).toHaveBeenCalledWith("domain", { name: "Bacteria", description: "Prokaryotes.", date_discovered: "1830" }));
  });

  it("does not post, and shows the error toast, until everything is filled in", () => {
    const { create, notify } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Create Genus" }));
    expect(create).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith("error", "Genus", "Select a family and fill in Name and Description.");
  });

  it("shows the server's message when the create fails", async () => {
    const create = vi.fn().mockRejectedValue(new Error("name: Already exists."));
    const notify = vi.fn();
    render(<TaxonomyTab taxonomy={taxonomy} isMobile={false} create={create} onCreated={vi.fn()} notify={notify} />);
    fireEvent.click(screen.getByRole("button", { name: /Domain/ }));
    fireEvent.change(screen.getByPlaceholderText("e.g. Eukarya"), { target: { value: "Bacteria" } });
    fireEvent.change(screen.getByPlaceholderText("A short description of this domain"), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Domain" }));
    await waitFor(() => expect(notify).toHaveBeenCalledWith("error", "Domain", "name: Already exists."));
  });
});
