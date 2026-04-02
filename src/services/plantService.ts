import type { Plant } from "../types/plant";
import pb from "../back-end/db";

export const fetchPlants = async (): Promise<Plant[]> => {
  try {
    const records = await pb.collection("species").getFullList<any>({
      requestKey: null, // Disable auto-cancellation
    });

    const plants = records.map((record: any) => {
      // Build image URL - try field first (primary image field), then image as fallback
      let imageUrl = "";
      if (record.field) {
        imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.field}`;
      } else if (record.image) {
        imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.image}`;
      }

      return {
        id: record.id,
        commonName: record.commonName || record.name || "Unknown",
        scientificName: record.scientificName || "",
        image: imageUrl,
        genus: record.genus || "",
        author: record.author || "",
        year: record.year || null,
        conservationStatus: record.conservationStatus || "",
        notes: record.notes || "",
        field: record.field || "",
        // Legacy fields (may not exist in species)
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
    });

    console.log("✅ Plants list loaded from species collection:", plants.length, "items");
    return plants;
  } catch (error) {
    if (error instanceof Error && !error.message.includes("aborted")) {
      console.error("Error fetching plants:", error);
    }
    return [];
  }
};

export const fetchPlantById = async (id: string): Promise<Plant | null> => {
  try {
    const record = await pb.collection("species").getOne<any>(id, {
      requestKey: null, // Disable auto-cancellation
    });

    // Build image URL - try field first (primary image field), then image as fallback
    let imageUrl = "";
    if (record.field) {
      imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.field}`;
    } else if (record.image) {
      imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.image}`;
    }

    const plant = {
      id: record.id,
      commonName: record.commonName || record.name || "Unknown",
      scientificName: record.scientificName || "",
      image: imageUrl,
      genus: record.genus || "",
      author: record.author || "",
      year: record.year || null,
      conservationStatus: record.conservationStatus || "",
      notes: record.notes || "",
      field: record.field || "",
      // Legacy fields (may not exist in species)
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

    console.log("✅ Plant loaded from species:", plant.commonName);
    return plant;
  } catch (error) {
    if (error instanceof Error && !error.message.includes("aborted")) {
      console.error("Error fetching plant:", error);
    }
    return null;
  }
};

/**
 * Add a new plant to the database
 * @param plantData - Plant data including name, description, scientificName, etc.
 * @returns Created plant record
 */
export const addPlant = async (plantData: Partial<Plant>): Promise<Plant | null> => {
  try {
    if (!plantData.commonName || !plantData.commonName.trim()) {
      throw new Error("Plant common name is required");
    }

    const record = await pb.collection("species").create({
      commonName: plantData.commonName.trim(),
      scientificName: plantData.scientificName?.trim() || "",
      genus: plantData.genus?.trim() || "",
      author: plantData.author?.trim() || "",
      year: plantData.year || null,
      conservationStatus: plantData.conservationStatus?.trim() || "",
      notes: plantData.notes?.trim() || "",
      // Legacy fields
      kingdom: plantData.kingdom?.trim() || "",
      order: plantData.order?.trim() || "",
      family: plantData.family?.trim() || "",
      subfamily: plantData.subfamily?.trim() || "",
      species: plantData.species?.trim() || "",
      morphology: plantData.morphology?.trim() || "",
      ecology: plantData.ecology?.trim() || "",
      distribution: plantData.distribution?.trim() || "",
      uses: plantData.uses?.trim() || "",
      description: plantData.description?.trim() || "",
    });

    console.log("✅ Plant added successfully to species:", record);

    return {
      id: record.id,
      commonName: record.commonName || "Unknown",
      scientificName: record.scientificName || "",
      image: "",
      genus: record.genus || "",
      author: record.author || "",
      year: record.year || null,
      conservationStatus: record.conservationStatus || "",
      notes: record.notes || "",
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
    const errorMessage = error instanceof Error ? error.message : "Failed to add plant";
    console.error("Error adding plant:", errorMessage);
    throw error;
  }
};

/**
 * Update an existing plant
 * @param id - Plant ID
 * @param plantData - Updated plant data
 * @returns Updated plant record
 */
export const updatePlant = async (id: string, plantData: Partial<Plant>): Promise<Plant | null> => {
  try {
    if (!id || !id.trim()) {
      throw new Error("Plant ID is required");
    }

    const updateData: any = {};
    if (plantData.commonName) updateData.commonName = plantData.commonName.trim();
    if (plantData.scientificName) updateData.scientificName = plantData.scientificName.trim();
    if (plantData.genus) updateData.genus = plantData.genus.trim();
    if (plantData.author) updateData.author = plantData.author.trim();
    if (plantData.year) updateData.year = plantData.year;
    if (plantData.conservationStatus) updateData.conservationStatus = plantData.conservationStatus.trim();
    if (plantData.notes) updateData.notes = plantData.notes.trim();
    if (plantData.kingdom) updateData.kingdom = plantData.kingdom.trim();
    if (plantData.order) updateData.order = plantData.order.trim();
    if (plantData.family) updateData.family = plantData.family.trim();
    if (plantData.subfamily) updateData.subfamily = plantData.subfamily.trim();
    if (plantData.species) updateData.species = plantData.species.trim();
    if (plantData.morphology) updateData.morphology = plantData.morphology.trim();
    if (plantData.ecology) updateData.ecology = plantData.ecology.trim();
    if (plantData.distribution) updateData.distribution = plantData.distribution.trim();
    if (plantData.uses) updateData.uses = plantData.uses.trim();
    if (plantData.description) updateData.description = plantData.description.trim();

    const record = await pb.collection("species").update(id, updateData);

    console.log("✅ Plant updated successfully in species:", record);

    // Build image URL
    let imageUrl = "";
    if (record.image) {
      imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.image}`;
    } else if (record.field) {
      imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.field}`;
    }

    return {
      id: record.id,
      commonName: record.commonName || "Unknown",
      scientificName: record.scientificName || "",
      image: imageUrl,
      genus: record.genus || "",
      author: record.author || "",
      year: record.year || null,
      conservationStatus: record.conservationStatus || "",
      notes: record.notes || "",
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
    const errorMessage = error instanceof Error ? error.message : "Failed to update plant";
    console.error("Error updating plant:", errorMessage);
    throw error;
  }
};

/**
 * Delete a plant from the database
 * @param id - Plant ID
 * @returns true if successful
 */
export const deletePlant = async (id: string): Promise<boolean> => {
  try {
    if (!id || !id.trim()) {
      throw new Error("Plant ID is required");
    }

    await pb.collection("species").delete(id);

    console.log("✅ Plant deleted successfully from species");
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete plant";
    console.error("Error deleting plant:", errorMessage);
    throw error;
  }
};
