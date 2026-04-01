
export interface Plant {
  id: string;
  name?: string;
  commonName: string;  // Main display name from species.commonName
  scientificName: string;  // Binomial name from species.scientificName
  commonNames?: string;
  image?: string;  // Image from species collection
  
  // Species Metadata
  genus?: string;  // Reference to genus
  author?: string;  // Author who named the species
  year?: number;  // Year of scientific description
  conservationStatus?: string;  // Conservation status
  notes?: string;  // Additional notes
  field?: string;  // Alternative image field
  
  // Taxonomy (Legacy - may not be present in species)
  kingdom?: string;
  order?: string;
  family?: string;
  subfamily?: string;
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
    subfamily: string;
    genus: string;
    species: string;
  };
}
