import type { Plant } from "../types/plant";
import pb from "../back-end/db";

export const fetchPlants = async (): Promise<Plant[]> => {
  try {
    const records = await pb.collection("class").getFullList<any>({
      requestKey: null, // Disable auto-cancellation
    });
    
    return records.map((record: any) => ({
      id: record.id,
      name: record.name,
      commonName: record.name,
      scientificName: record.scientificName || "",
      commonNames: record.commonNames || "",
      image: record.image ? `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/class/${record.id}/${record.image}` : "",
      kingdom: record.kingdom || "",
      order: record.order || "",
      family: record.family || "",
      subfamily: record.subfamily || "",
      species: record.species || "",
      morphology: record.morphology || "",
      ecology: record.ecology || "",
      distribution: record.distribution || "",
      uses: record.uses || "",
      description: record.description || "",
    }));
  } catch (error) {
    if (error instanceof Error && !error.message.includes('aborted')) {
      console.error("Error fetching plants:", error);
    }
    return [];
  }
};

export const fetchPlantById = async (id: string): Promise<Plant | null> => {
  try {
    const record = await pb.collection("class").getOne<any>(id, {
      requestKey: null, // Disable auto-cancellation
    });
    
    return {
      id: record.id,
      name: record.name,
      commonName: record.name,
      scientificName: record.scientificName || "",
      commonNames: record.commonNames || "",
      image: record.image ? `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/class/${record.id}/${record.image}` : "",
      kingdom: record.kingdom || "",
      order: record.order || "",
      family: record.family || "",
      subfamily: record.subfamily || "",
      species: record.species || "",
      morphology: record.morphology || "",
      ecology: record.ecology || "",
      distribution: record.distribution || "",
      uses: record.uses || "",
      description: record.description || "",
    };
  } catch (error) {
    if (error instanceof Error && !error.message.includes('aborted')) {
      console.error("Error fetching plant:", error);
    }
    return null;
  }
};
