import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: string[] = [];
const state = { detailsFails: false, speciesDeleteFails: false, detailRows: [] as Array<Record<string, string>> };

vi.mock("../back-end/db", () => {
  const collection = (name: string) => ({
    create: vi.fn(async (body: Record<string, unknown>) => {
      calls.push(`${name}.create`);
      if (name === "details" && state.detailsFails) throw new Error("details down");
      return { id: name === "species" ? "plant1plant1plan" : "d1", ...body };
    }),
    update: vi.fn(async () => {
      calls.push(`${name}.update`);
      if (name === "details" && state.detailsFails) throw new Error("details down");
      return { id: "plant1plant1plan" };
    }),
    delete: vi.fn(async (id: string) => {
      calls.push(`${name}.delete:${id}`);
      if (name === "species" && state.speciesDeleteFails) throw new Error("locked");
    }),
    getList: vi.fn(async () => ({ items: [] })),
    getFullList: vi.fn(async () => (name === "details" ? state.detailRows : [])),
  });
  return { default: { collection, filter: (q: string) => q } };
});

import { createPlant, deletePlant, updatePlant } from "./plantAdmin";

beforeEach(() => {
  calls.length = 0;
  state.detailsFails = false;
  state.speciesDeleteFails = false;
  state.detailRows = [];
});

describe("createPlant", () => {
  it("removes the new plant again when its details cannot be saved", async () => {
    state.detailsFails = true;
    await expect(createPlant({ commonName: "Narra" })).rejects.toThrow(/Nothing was saved/);
    expect(calls).toContain("species.delete:plant1plant1plan");
  });

  it("keeps the plant when everything saves", async () => {
    const plant = await createPlant({ commonName: "Narra", ecology: "forest" });
    expect(plant.ecology).toBe("forest");
    expect(calls.some((c) => c.startsWith("species.delete"))).toBe(false);
  });
});

describe("updatePlant", () => {
  it("says so when only part of the save worked", async () => {
    state.detailsFails = true;
    await expect(updatePlant("plant1plant1plan", { commonName: "Narra" })).rejects.toThrow(
      /plant information was saved, but the description sections/
    );
  });
});

describe("deletePlant", () => {
  it("puts the details back when the plant cannot be deleted", async () => {
    state.detailRows = [{ id: "d1", species: "plant1plant1plan", ecology: "forest" }];
    state.speciesDeleteFails = true;
    await expect(deletePlant("plant1plant1plan")).rejects.toThrow("locked");
    expect(calls).toEqual(["details.delete:d1", "species.delete:plant1plant1plan", "details.create"]);
  });
});
