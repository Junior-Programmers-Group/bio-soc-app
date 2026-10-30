import type { Plant } from "../types/plant";
import type { DetailsRecord, SpeciesRecord, TaxonRecord } from "../types/records";
import pb from "../back-end/db";
import { getSpeciesImageUrl } from "./imageUrl";
import { isNotFound } from "./errors";
import { splitCommonNames } from "../lib/format";

// ---------------------------------------------------------------------------
// Cache (5 minutes). Admin changes call clearPlantCache() so edits show at once.
// ---------------------------------------------------------------------------

const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { data: unknown; timestamp: number }>();

const getCached = <T>(key: string): T | null => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.timestamp < CACHE_TTL) return hit.data as T;
  cache.delete(key);
  return null;
};

const setCached = (key: string, data: unknown) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/** Forget everything loaded so far. Call after any change to plants or taxonomy. */
export const clearPlantCache = () => cache.clear();

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

export interface TaxonomyHierarchy {
  domain?: string;
  kingdom?: string;
  phylum?: string;
  klass?: string; // class
  order?: string;
  family?: string;
  genus?: string;
}

// PocketBase expands at most 6 levels, so the list requests stop at kingdom and
// the domain name is looked up separately (see fetchDomainNames).
const SPECIES_EXPAND = "genus.family.order.class.phylum.kingdom";
const GENUS_EXPAND = "family.order.class.phylum.kingdom.domain";

// Each step: relation to follow on the current row, and where its name goes.
const PARENT_CHAIN = [
  ["family", "family"],
  ["order", "order"],
  ["class", "klass"],
  ["phylum", "phylum"],
  ["kingdom", "kingdom"],
  ["domain", "domain"],
] as const;

const first = <T>(value: T | T[] | undefined): T | undefined =>
  Array.isArray(value) ? value[0] : value;

/** Read the names of a genus and all its ancestors from an expanded genus row. */
const hierarchyFromGenus = (
  genus: TaxonRecord | undefined,
  domainNames?: Map<string, string>
): TaxonomyHierarchy => {
  const result: TaxonomyHierarchy = {};
  if (!genus) return result;

  result.genus = genus.name || "";
  let node: TaxonRecord | undefined = genus;
  for (const [relation, key] of PARENT_CHAIN) {
    const parent: TaxonRecord | undefined = first(node.expand?.[relation]);
    if (!parent) {
      // Domain is not expanded on list requests: resolve it from the kingdom's id.
      if (relation === "domain" && domainNames) {
        const domainId = first(node.domain);
        if (domainId && domainNames.has(domainId)) result.domain = domainNames.get(domainId);
      }
      break;
    }
    result[key] = parent.name || "";
    node = parent;
  }
  return result;
};

/** Names of a genus and everything above it. Throws if the request fails. */
export const fetchTaxonomyHierarchy = async (genusId: string): Promise<TaxonomyHierarchy> => {
  if (!genusId) return {};
  const genus = await pb.collection("genus").getOne<TaxonRecord>(genusId, {
    expand: GENUS_EXPAND,
    requestKey: null,
  });
  return hierarchyFromGenus(genus);
};

/** id -> name for all domains. A missing `domain` collection just gives an empty map. */
const fetchDomainNames = async (): Promise<Map<string, string>> => {
  const cached = getCached<Map<string, string>>("domainNames");
  if (cached) return cached;
  try {
    const rows = await pb
      .collection("domain")
      .getFullList<TaxonRecord>({ fields: "id,name", requestKey: null });
    const names = new Map(rows.map((row) => [row.id, row.name || ""]));
    setCached("domainNames", names);
    return names;
  } catch (error) {
    if (isNotFound(error)) return new Map();
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Plants
// ---------------------------------------------------------------------------

const toPlant = (
  record: SpeciesRecord,
  details: DetailsRecord | undefined,
  domainNames: Map<string, string>
): Plant => {
  const taxonomy = hierarchyFromGenus(first(record.expand?.genus), domainNames);
  const { name, aliases } = splitCommonNames(record.commonName);
  return {
    id: record.id,
    commonName: name || "Unknown",
    aliases,
    commonNames: record.commonName || "",
    code: record.code || "",
    created: record.created,
    updated: record.updated,
    scientificName: record.scientificName || "",
    image: getSpeciesImageUrl(record),
    thumbnail: getSpeciesImageUrl(record, "400x300"),
    genus: taxonomy.genus || "",
    genusId: record.genus || "",
    author: record.author || "",
    year: record.year || undefined,
    conservationStatus: record.conservationStatus || "",
    notes: record.notes || "",
    field: record.field || "",
    domain: taxonomy.domain || "",
    kingdom: taxonomy.kingdom || "",
    phylum: taxonomy.phylum || "",
    klass: taxonomy.klass || "",
    order: taxonomy.order || "",
    family: taxonomy.family || "",
    morphology: details?.morphology || "",
    ecology: details?.ecology || "",
    distribution: details?.distribution || "",
    uses: details?.uses || "",
  };
};

/** All plants, with taxonomy and details. Throws if the server cannot be reached. */
export const fetchPlants = async (): Promise<Plant[]> => {
  const cached = getCached<Plant[]>("allPlants");
  if (cached) return cached;

  const [records, detailRows, domainNames] = await Promise.all([
    pb.collection("species").getFullList<SpeciesRecord>({
      expand: SPECIES_EXPAND,
      requestKey: null,
    }),
    pb.collection("details").getFullList<DetailsRecord>({ requestKey: null }),
    fetchDomainNames(),
  ]);

  const detailsBySpecies = new Map(detailRows.map((row) => [row.species, row]));
  const plants = records.map((record) =>
    toPlant(record, detailsBySpecies.get(record.id), domainNames)
  );

  setCached("allPlants", plants);
  return plants;
};

/**
 * One plant with taxonomy and details.
 * Returns null when the plant does not exist; throws for any other failure.
 */
export const fetchPlantById = async (id: string): Promise<Plant | null> => {
  const cacheKey = `plant_${id}`;
  const cached = getCached<Plant>(cacheKey);
  if (cached) return cached;

  try {
    const [record, details, domainNames] = await Promise.all([
      pb.collection("species").getOne<SpeciesRecord>(id, {
        expand: SPECIES_EXPAND,
        requestKey: null,
      }),
      pb
        .collection("details")
        .getFirstListItem<DetailsRecord>(pb.filter("species = {:id}", { id }), {
          requestKey: null,
        })
        .catch((error) => {
          if (isNotFound(error)) return undefined; // a plant may have no details yet
          throw error;
        }),
      fetchDomainNames(),
    ]);

    const plant = toPlant(record, details, domainNames);
    setCached(cacheKey, plant);
    return plant;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};
