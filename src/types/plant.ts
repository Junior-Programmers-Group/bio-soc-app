
export interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
  image: string;

  taxonomy?: {
    kingdom: string;
    order: string;
    family: string;
    subfamily: string;
    genus: string;
    species: string;
  };

  description?: string;
}
