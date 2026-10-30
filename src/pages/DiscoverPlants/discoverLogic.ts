import type { Plant } from "../../types/plant";
import { statusOf, type StatusKey } from "../../lib/status";

export type SearchMode = "all" | "name" | "sci";
export type StatusFilter = "All" | Exclude<StatusKey, "OTHER">;
export type RankKey = "kingdom" | "phylum" | "class" | "order" | "family" | "genus";
export type Taxonomy = Partial<Record<RankKey, string>>;

/** Taxonomic ranks, highest first. Filters cascade in this order. */
export const RANKS: Array<{ key: RankKey; label: string; any: string }> = [
  { key: "kingdom", label: "Kingdom", any: "All kingdoms" },
  { key: "phylum", label: "Phylum", any: "All phyla" },
  { key: "class", label: "Class", any: "All classes" },
  { key: "order", label: "Order", any: "All orders" },
  { key: "family", label: "Family", any: "All families" },
  { key: "genus", label: "Genus", any: "All genera" },
];

/** The ranks shown under "More classification". */
export const MORE_RANKS: RankKey[] = ["kingdom", "phylum", "class", "order"];

export const rankValue = (plant: Plant, key: RankKey): string =>
  (key === "class" ? plant.klass : plant[key]) || "";

export const matchesQuery = (plant: Plant, query: string, mode: SearchMode): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const aliases = plant.aliases ?? [];
  const fields =
    mode === "name"
      ? [plant.commonName, ...aliases]
      : mode === "sci"
        ? [plant.scientificName]
        : [plant.commonName, plant.scientificName, plant.family ?? "", plant.genus ?? "", ...aliases];
  return fields.some((field) => (field ?? "").toLowerCase().includes(q));
};

/** Does the plant match every chosen rank among the first `upto` ranks? */
export const fitsTaxonomy = (plant: Plant, taxonomy: Taxonomy, upto = RANKS.length): boolean =>
  RANKS.slice(0, upto).every(({ key }) => !taxonomy[key] || rankValue(plant, key) === taxonomy[key]);

/**
 * Choose (or clear, with an empty value) one rank. Lower ranks that no longer
 * match any plant under the new choice are cleared.
 */
export const chooseRank = (
  taxonomy: Taxonomy,
  plants: Plant[],
  key: RankKey,
  value: string
): Taxonomy => {
  const index = RANKS.findIndex((rank) => rank.key === key);
  const next: Taxonomy = { ...taxonomy, [key]: value };
  RANKS.slice(index + 1).forEach(({ key: lower }) => {
    if (next[lower] && !plants.some((plant) => fitsTaxonomy(plant, next))) delete next[lower];
  });
  if (!value) delete next[key];
  return next;
};

export interface RankFilter {
  key: RankKey;
  label: string;
  any: string;
  value: string;
  options: string[];
}

/** Options for each rank, narrowed by the higher ranks already chosen. */
export const buildRankFilters = (searched: Plant[], taxonomy: Taxonomy): RankFilter[] =>
  RANKS.map(({ key, label, any }, i) => ({
    key,
    label,
    any,
    value: taxonomy[key] ?? "",
    options: Array.from(
      new Set(searched.filter((p) => fitsTaxonomy(p, taxonomy, i)).map((p) => rankValue(p, key)))
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
  }));

export interface StatusRow {
  key: StatusFilter;
  label: string;
  count: number;
}

/** "Any status" and the three designed statuses, counted within the current query and ranks. */
export const buildStatusRows = (searched: Plant[], taxonomy: Taxonomy): StatusRow[] => {
  const pool = searched.filter((p) => fitsTaxonomy(p, taxonomy));
  const countOf = (key: StatusKey) => pool.filter((p) => statusOf(p.conservationStatus).key === key).length;
  return [
    { key: "All", label: "Any status", count: pool.length },
    { key: "LC", label: "Least Concern", count: countOf("LC") },
    { key: "VU", label: "Vulnerable", count: countOf("VU") },
    { key: "EN", label: "Endangered", count: countOf("EN") },
  ];
};

/** The plants to show: search, ranks and status applied, sorted by common name. */
export const visiblePlants = (
  plants: Plant[],
  query: string,
  mode: SearchMode,
  taxonomy: Taxonomy,
  status: StatusFilter,
  sort: "az" | "za"
): Plant[] =>
  plants
    .filter((p) => matchesQuery(p, query, mode))
    .filter((p) => fitsTaxonomy(p, taxonomy))
    .filter((p) => status === "All" || statusOf(p.conservationStatus).key === status)
    .sort((a, b) =>
      sort === "az" ? a.commonName.localeCompare(b.commonName) : b.commonName.localeCompare(a.commonName)
    );

export const searchPlaceholder = (mode: SearchMode): string =>
  mode === "name"
    ? "Search common names…"
    : mode === "sci"
      ? "Search scientific names…"
      : "Search by name, scientific name or family…";
