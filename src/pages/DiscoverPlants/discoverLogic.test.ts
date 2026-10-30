import { describe, expect, it } from "vitest";
import type { Plant } from "../../types/plant";
import {
  buildRankFilters,
  buildStatusRows,
  chooseRank,
  matchesQuery,
  visiblePlants,
} from "./discoverLogic";

const plant = (over: Partial<Plant>): Plant => ({
  id: "x",
  commonName: "Plant",
  scientificName: "Genus species",
  kingdom: "Plantae",
  phylum: "Tracheophyta",
  klass: "Magnoliopsida",
  order: "Fabales",
  family: "Fabaceae",
  genus: "Genus",
  conservationStatus: "Least Concern",
  aliases: [],
  ...over,
});

const narra = plant({
  id: "1",
  commonName: "Narra",
  scientificName: "Pterocarpus indicus",
  genus: "Pterocarpus",
  conservationStatus: "Vulnerable",
  aliases: ["Philippine rosewood"],
});
const mahogany = plant({
  id: "2",
  commonName: "Mahogany",
  scientificName: "Swietenia macrophylla",
  order: "Sapindales",
  family: "Meliaceae",
  genus: "Swietenia",
  conservationStatus: "Vulnerable",
});
const papaya = plant({
  id: "3",
  commonName: "Papaya",
  scientificName: "Carica papaya",
  order: "Brassicales",
  family: "Caricaceae",
  genus: "Carica",
  conservationStatus: "Data Deficient (DD)",
});
const all = [narra, mahogany, papaya];

describe("matchesQuery", () => {
  it("matches names, scientific names, family and aliases by default", () => {
    expect(matchesQuery(narra, "rosewood", "all")).toBe(true);
    expect(matchesQuery(narra, "fabaceae", "all")).toBe(true);
    expect(matchesQuery(narra, "PTERO", "all")).toBe(true);
    expect(matchesQuery(narra, "mahogany", "all")).toBe(false);
  });

  it("limits the fields in the other modes", () => {
    expect(matchesQuery(narra, "pterocarpus", "name")).toBe(false);
    expect(matchesQuery(narra, "rosewood", "name")).toBe(true);
    expect(matchesQuery(narra, "narra", "sci")).toBe(false);
    expect(matchesQuery(narra, "indicus", "sci")).toBe(true);
  });
});

describe("rank filters", () => {
  it("narrow lower ranks by the ranks already chosen", () => {
    const narrowed = buildRankFilters(all, { order: "Fabales" }).find((f) => f.key === "family")!;
    expect(narrowed.options).toEqual(["Fabaceae"]);
    const open = buildRankFilters(all, {}).find((f) => f.key === "family")!;
    expect(open.options).toEqual(["Caricaceae", "Fabaceae", "Meliaceae"]);
  });

  it("clear a lower choice that no plant matches any more", () => {
    const next = chooseRank({ family: "Fabaceae", genus: "Pterocarpus" }, all, "order", "Sapindales");
    expect(next).toEqual({ order: "Sapindales" });
  });

  it("clear a rank when it is set to empty", () => {
    expect(chooseRank({ family: "Fabaceae" }, all, "family", "")).toEqual({});
  });
});

describe("status", () => {
  it("counts the three statuses and keeps other statuses under 'Any status'", () => {
    const rows = buildStatusRows(all, {});
    expect(rows.map((r) => [r.key, r.count])).toEqual([
      ["All", 3],
      ["LC", 0],
      ["VU", 2],
      ["EN", 0],
    ]);
  });
});

describe("visiblePlants", () => {
  it("filters by status and sorts by name", () => {
    const vulnerable = visiblePlants(all, "", "all", {}, "VU", "az").map((p) => p.commonName);
    expect(vulnerable).toEqual(["Mahogany", "Narra"]);
    const reversed = visiblePlants(all, "", "all", {}, "All", "za").map((p) => p.commonName);
    expect(reversed).toEqual(["Papaya", "Narra", "Mahogany"]);
  });
});
