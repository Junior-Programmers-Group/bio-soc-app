
export interface Plant {
  id: string;
  name: string;
  commonName?: string;
  scientificName?: string;
  commonNames?: string;
  image?: string;
  
  // Taxonomy
  kingdom?: string;
  order?: string;
  family?: string;
  subfamily?: string;
  species?: string;
  
  // Details
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
