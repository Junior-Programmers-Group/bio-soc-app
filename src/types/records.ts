// Shapes of the PocketBase records the app reads. They mirror the live schema:
// `species` has exactly these fields; morphology/ecology/distribution/uses live in `details`.

/** A taxonomy row (genus, family, order, ...). Parents arrive in `expand` when requested. */
export interface TaxonRecord {
  id: string;
  name?: string;
  /** Only on kingdom rows: id of the domain. */
  domain?: string | string[];
  expand?: Record<string, TaxonRecord | TaxonRecord[] | undefined>;
}

/** A row of the `species` collection. */
export interface SpeciesRecord {
  id: string;
  collectionId?: string;
  collectionName?: string;
  commonName?: string;
  scientificName?: string;
  /** Id of the genus row. */
  genus?: string;
  author?: string;
  year?: number;
  conservationStatus?: string;
  notes?: string;
  /** File name of the main image. */
  field?: string;
  expand?: { genus?: TaxonRecord | TaxonRecord[] };
}

/** A row of the `details` collection (one per species). */
export interface DetailsRecord {
  id: string;
  species: string;
  morphology?: string;
  ecology?: string;
  distribution?: string;
  uses?: string;
}

/** The long-text fields stored in `details`. */
export interface PlantDetailsInput {
  morphology: string;
  ecology: string;
  distribution: string;
  uses: string;
}
