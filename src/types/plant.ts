
export interface Plant {
  id: string;
  name?: string;
  commonName: string;  // Display name: the first of the common names in species.commonName
  aliases?: string[];  // The other common names ("Also called ...")
  code?: string;  // Specimen code, e.g. NDDU-0001
  created?: string;
  updated?: string;
  scientificName: string;  // Binomial name from species.scientificName
  commonNames?: string;  // Every common name exactly as stored, separated by " / "
  image?: string;  // Image from species collection
  thumbnail?: string;  // Smaller copy for lists and cards
  
  // Species Metadata
  genus?: string;  // Reference to genus name or ID
  genusId?: string;  // Genus record ID (if available separately)
  author?: string;  // Author who named the species
  year?: number;  // Year of scientific description
  conservationStatus?: string;  // Conservation status
  notes?: string;  // Additional notes
  field?: string;  // Alternative image field
  
  // Taxonomy (from relationships)
  domain?: string;
  kingdom?: string;
  phylum?: string;
  klass?: string;  // Class (renamed to avoid keyword)
  order?: string;
  family?: string;
  species?: string;
  
  // Details (Legacy - may not be present in species)
  morphology?: string;
  ecology?: string;
  distribution?: string;
  uses?: string;
  
  // Legacy
  description?: string;
  taxonomy?: {
    kingdom: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
}
