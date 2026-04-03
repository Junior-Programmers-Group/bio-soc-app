import type { Plant } from "../types/plant";
import pb from "../back-end/db";

interface TaxonomyHierarchy {
  domain?: string;
  kingdom?: string;
  phylum?: string;
  klass?: string;  // Class
  order?: string;
  family?: string;
  subfamily?: string;
  genus?: string;
}

export const fetchTaxonomyHierarchy = async (genusIdOrName: string): Promise<TaxonomyHierarchy> => {
  try {
    console.log("🔍 fetchTaxonomyHierarchy called with genusIdOrName:", genusIdOrName);
    
    if (!genusIdOrName) {
      console.warn("⚠️  No genusIdOrName provided");
      return {};
    }

    const hierarchy: TaxonomyHierarchy = {};

    // Fetch Genus record
    console.log("📍 Fetching Genus record:", genusIdOrName);
    
    let genusRecord = await pb.collection("genus").getOne<any>(genusIdOrName, {
      requestKey: null,
    });

    hierarchy.genus = genusRecord.name;
    console.log("✓ Genus found:", genusRecord.name);
    console.log("  Genus fields:", Object.keys(genusRecord));
    console.log("  Genus has 'family' field?:", genusRecord.family);

    // Each level has direct fields for its parent: family, order, class, phylum, kingdom, domain
    const fieldMapping = {
      "genus": { fieldName: "family", nextCollection: "family", nextLevelField: "order" },
      "family": { fieldName: "order", nextCollection: "order", nextLevelField: "class" },
      "order": { fieldName: "class", nextCollection: "class", nextLevelField: "phylum" },
      "class": { fieldName: "phylum", nextCollection: "phylum", nextLevelField: "kingdom" },
      "phylum": { fieldName: "kingdom", nextCollection: "kingdom", nextLevelField: "domain" },
      "kingdom": { fieldName: "domain", nextCollection: "domain", nextLevelField: null },
    };

    // Start with Genus and traverse up through direct field references
    let currentLevel = "genus";
    let currentRecord = genusRecord;
    let traversalCount = 0;
    const maxTraversals = 10;

    while (traversalCount < maxTraversals) {
      traversalCount++;
      console.log(`\n↑ STEP ${traversalCount}: Current level="${currentLevel}"`);

      const mapping = fieldMapping[currentLevel as keyof typeof fieldMapping];
      if (!mapping) {
        console.log(`  ⚠️ No mapping found for level "${currentLevel}" - stopping traversal`);
        break;
      }

      const parentFieldName = mapping.fieldName;
      const parentId = currentRecord[parentFieldName];

      if (!parentId) {
        console.log(`  ℹ️ No ${parentFieldName} field or it's empty on ${currentLevel} - reached end of hierarchy`);
        break;
      }

      console.log(`  → Found ${parentFieldName} ID: ${parentId}`);

      try {
        // Fetch parent record
        const nextCollection = mapping.nextCollection;
        console.log(`  📍 Fetching ${nextCollection} record...`);
        
        const parentRecord = await pb.collection(nextCollection).getOne<any>(parentId, {
          requestKey: null,
        });

        const parentName = parentRecord.name;
        console.log(`  ✓ Found: ${nextCollection}="${parentName}"`);

        // Map to hierarchy based on next collection
        switch (nextCollection) {
          case "family":
            hierarchy.family = parentName;
            console.log(`      Set hierarchy.family = "${parentName}"`);
            break;
          case "order":
            hierarchy.order = parentName;
            console.log(`      Set hierarchy.order = "${parentName}"`);
            break;
          case "class":
            hierarchy.klass = parentName;
            console.log(`      Set hierarchy.klass = "${parentName}"`);
            break;
          case "phylum":
            hierarchy.phylum = parentName;
            console.log(`      Set hierarchy.phylum = "${parentName}"`);
            break;
          case "kingdom":
            hierarchy.kingdom = parentName;
            console.log(`      Set hierarchy.kingdom = "${parentName}"`);
            break;
          case "domain":
            hierarchy.domain = parentName;
            console.log(`      Set hierarchy.domain = "${parentName}"`);
            break;
        }

        // Move to next level
        currentRecord = parentRecord;
        currentLevel = nextCollection;
      } catch (err) {
        console.error(`  ✗ Error fetching ${mapping.nextCollection}:`, err);
        break;
      }
    }

    if (traversalCount >= maxTraversals) {
      console.warn("⚠️  Reached max traversal limit!");
    }

    console.log("\n✅ FINAL HIERARCHY:", hierarchy);
    return hierarchy;
  } catch (error) {
    console.error("❌ CRITICAL ERROR in fetchTaxonomyHierarchy:", error);
    return {};
  }
};

export const fetchPlants = async (): Promise<Plant[]> => {
  try {
    const records = await pb.collection("species").getFullList<any>({
      expand: "genus_id",
      requestKey: null, // Disable auto-cancellation
    });

    console.log("📦 Fetched", records.length, "species records");

    const plants: Plant[] = [];

    for (const record of records) {
      // Build image URL - try field first (primary image field), then image as fallback
      let imageUrl = "";
      if (record.field) {
        imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.field}`;
      } else if (record.image) {
        imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.image}`;
      }

      // Get genus info
      let genusName = record.genus || "";
      let genusId = record.genus_id || "";
      let taxonomy: any = {
        domain: record.domain || "",
        kingdom: record.kingdom || "",
        phylum: record.phylum || "",
        klass: record.klass || "",
        order: record.order || "",
        family: record.family || "",
      };

      // Try to fetch hierarchy if genus is available
      if (record.expand?.genus_id && genusId) {
        const genusRecord = Array.isArray(record.expand.genus_id) 
          ? record.expand.genus_id[0] 
          : record.expand.genus_id;
        
        if (genusRecord) {
          genusName = genusRecord.name || genusName;
          genusId = genusRecord.id || genusId;
          
          try {
            console.log("📍 Fetching taxonomy hierarchy for genus:", genusId);
            const hierarchy = await fetchTaxonomyHierarchy(genusId);
            console.log("✓ Hierarchy retrieved:", hierarchy);
            
            // Merge with direct fields
            taxonomy = {
              domain: hierarchy.domain || record.domain || "",
              kingdom: hierarchy.kingdom || record.kingdom || "",
              phylum: hierarchy.phylum || record.phylum || "",
              klass: hierarchy.klass || record.klass || "",
              order: hierarchy.order || record.order || "",
              family: hierarchy.family || record.family || "",
            };
          } catch (err) {
            console.warn("⚠️ Failed to fetch hierarchy for genus", genusName, "- using direct fields only");
          }
        }
      }

      const plant: Plant = {
        id: record.id,
        commonName: record.commonName || record.name || "Unknown",
        scientificName: record.scientificName || "",
        image: imageUrl,
        genus: genusName,
        genusId: genusId,
        author: record.author || "",
        year: record.year || null,
        conservationStatus: record.conservationStatus || "",
        notes: record.notes || "",
        field: record.field || "",
        // Taxonomy fields
        domain: taxonomy.domain,
        kingdom: taxonomy.kingdom,
        phylum: taxonomy.phylum,
        klass: taxonomy.klass,
        order: taxonomy.order,
        family: taxonomy.family,
        subfamily: record.subfamily || "",
        species: record.species || "",
        // Legacy fields
        morphology: record.morphology || "",
        ecology: record.ecology || "",
        distribution: record.distribution || "",
        uses: record.uses || "",
        description: record.description || "",
      };

      plants.push(plant);
      console.log("✅ Added plant:", plant.commonName, "| Taxonomy:", { domain: plant.domain, kingdom: plant.kingdom, family: plant.family });
    }

    console.log("✅ Plants list loaded:", plants.length, "items");
    if (plants.length > 0) {
      console.log("🔍 First plant full data:", plants[0]);
    }
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
      expand: "genus_id",
      requestKey: null, // Disable auto-cancellation
    });

    console.log("📌 Fetching plant:", record.id);

    // Build image URL - try field first (primary image field), then image as fallback
    let imageUrl = "";
    if (record.field) {
      imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.field}`;
    } else if (record.image) {
      imageUrl = `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.image}`;
    }

    // Get genus info
    let genusName = record.genus || "";
    let genusId = record.genus_id || "";
    let taxonomy: any = {
      domain: record.domain || "",
      kingdom: record.kingdom || "",
      phylum: record.phylum || "",
      klass: record.klass || "",
      order: record.order || "",
      family: record.family || "",
    };

    // Try to fetch hierarchy if genus is available
    if (record.expand?.genus_id && genusId) {
      const genusRecord = Array.isArray(record.expand.genus_id) 
        ? record.expand.genus_id[0] 
        : record.expand.genus_id;
      
      if (genusRecord) {
        genusName = genusRecord.name || genusName;
        genusId = genusRecord.id || genusId;
        
        try {
          console.log("📍 Fetching hierarchy for genus:", genusId);
          const hierarchy = await fetchTaxonomyHierarchy(genusId);
          console.log("✓ Hierarchy retrieved:", hierarchy);
          
          // Merge with direct fields
          taxonomy = {
            domain: hierarchy.domain || record.domain || "",
            kingdom: hierarchy.kingdom || record.kingdom || "",
            phylum: hierarchy.phylum || record.phylum || "",
            klass: hierarchy.klass || record.klass || "",
            order: hierarchy.order || record.order || "",
            family: hierarchy.family || record.family || "",
          };
        } catch (err) {
          console.warn("⚠️ Failed to fetch hierarchy for genus", genusName);
        }
      }
    }

    const plant: Plant = {
      id: record.id,
      commonName: record.commonName || record.name || "Unknown",
      scientificName: record.scientificName || "",
      image: imageUrl,
      genus: genusName,
      genusId: genusId,
      author: record.author || "",
      year: record.year || null,
      conservationStatus: record.conservationStatus || "",
      notes: record.notes || "",
      field: record.field || "",
      // Taxonomy fields
      domain: taxonomy.domain,
      kingdom: taxonomy.kingdom,
      phylum: taxonomy.phylum,
      klass: taxonomy.klass,
      order: taxonomy.order,
      family: taxonomy.family,
      subfamily: record.subfamily || "",
      species: record.species || "",
      // Legacy fields
      morphology: record.morphology || "",
      ecology: record.ecology || "",
      distribution: record.distribution || "",
      uses: record.uses || "",
      description: record.description || "",
    };

    console.log("✅ Plant loaded:", plant.commonName, "| Taxonomy:", { domain: plant.domain, kingdom: plant.kingdom, family: plant.family });
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
