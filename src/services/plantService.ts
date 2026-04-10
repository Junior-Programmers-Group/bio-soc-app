import type { Plant } from "../types/plant";
import pb from "../back-end/db";

// Request cache with TTL (5 minutes) for improving performance
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedRequest = (key: string): any | null => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("📦 Using cached data for:", key);
    return cached.data;
  }
  requestCache.delete(key);
  return null;
};

const setCachedRequest = (key: string, data: any) => {
  requestCache.set(key, { data, timestamp: Date.now() });
  console.log("💾 Cached request:", key);
};

interface TaxonomyHierarchy {
  domain?: string;
  kingdom?: string;
  phylum?: string;
  klass?: string;  // Class
  order?: string;
  family?: string;
  genus?: string;
}

export const fetchTaxonomyHierarchy = async (genusIdOrName: string, optionalFamilyId?: string): Promise<TaxonomyHierarchy> => {
  try {
    console.log("🔍 fetchTaxonomyHierarchy called with genusIdOrName:", genusIdOrName, "optionalFamilyId:", optionalFamilyId);
    
    if (!genusIdOrName && !optionalFamilyId) {
      console.warn("⚠️  No genusIdOrName or familyId provided");
      return {};
    }

    const hierarchy: TaxonomyHierarchy = {};

    // If we have a family ID, start from family and traverse up (preferred method)
    if (optionalFamilyId) {
      console.log("📍 Using family_id to traverse hierarchy (preferred method)");
      try {
        let currentRecord = await pb.collection("family").getOne<any>(optionalFamilyId, {
          requestKey: null,
        });

        hierarchy.family = currentRecord.name;
        console.log("✓ Family found:", currentRecord.name);

        // Traverse up: family → order → class → phylum → kingdom → domain
        const traversalPath = [
          { currentLevel: "family", parentField: "parent_id", nextCollection: "order", hierarchyKey: "order" },
          { currentLevel: "order", parentField: "parent_id", nextCollection: "class", hierarchyKey: "klass" },
          { currentLevel: "class", parentField: "parent_id", nextCollection: "phylum", hierarchyKey: "phylum" },
          { currentLevel: "phylum", parentField: "parent_id", nextCollection: "kingdom", hierarchyKey: "kingdom" },
          { currentLevel: "kingdom", parentField: "parent_id", nextCollection: "domain", hierarchyKey: "domain" },
        ];

        for (const step of traversalPath) {
          const parentId = currentRecord[step.parentField];
          if (!parentId) {
            console.log(`  ℹ️ No parent_id on ${step.currentLevel}, stopping traversal`);
            break;
          }

          console.log(`  → Found parent_id: ${parentId}, fetching ${step.nextCollection}`);
          currentRecord = await pb.collection(step.nextCollection).getOne<any>(parentId, {
            requestKey: null,
          });

          const parentName = currentRecord.name;
          hierarchy[step.hierarchyKey as keyof TaxonomyHierarchy] = parentName;
          console.log(`  ✓ ${step.nextCollection}="${parentName}"`);
        }

        // Now fetch genus separately
        if (genusIdOrName) {
          console.log("  📍 Fetching genus separately:", genusIdOrName);
          const genusRecord = await pb.collection("genus").getOne<any>(genusIdOrName, {
            requestKey: null,
          });
          hierarchy.genus = genusRecord.name;
          console.log("  ✓ Genus found:", genusRecord.name);
        }

        console.log("✅ FINAL HIERARCHY (from family):", hierarchy);
        return hierarchy;
      } catch (err) {
        console.error("⚠️ Failed to traverse from family, falling back to genus method:", err);
      }
    }

    // Fallback: Fetch Genus record and try to traverse from there
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

export const fetchTaxonomyOptions = async () => {
  const cacheKey = "taxonomyOptions";
  const cached = getCachedRequest(cacheKey);
  if (cached) return cached;

  try {
    console.log("📚 Fetching all taxonomy options from database...");
    
    const [domains, kingdoms, phylums, classes, orders, families, genera] = await Promise.all([
      pb.collection("domain").getFullList<any>({ requestKey: null }),
      pb.collection("kingdom").getFullList<any>({ requestKey: null }),
      pb.collection("phylum").getFullList<any>({ requestKey: null }),
      pb.collection("class").getFullList<any>({ requestKey: null }),
      pb.collection("order").getFullList<any>({ requestKey: null }),
      pb.collection("family").getFullList<any>({ requestKey: null }),
      pb.collection("genus").getFullList<any>({ requestKey: null }),
    ]);

    const options = {
      domain: domains.map(d => d.name).filter(Boolean).sort(),
      kingdom: kingdoms.map(k => k.name).filter(Boolean).sort(),
      phylum: phylums.map(p => p.name).filter(Boolean).sort(),
      klass: classes.map(c => c.name).filter(Boolean).sort(),
      order: orders.map(o => o.name).filter(Boolean).sort(),
      family: families.map(f => f.name).filter(Boolean).sort(),
      genus: genera.map(g => g.name).filter(Boolean).sort(),
    };

    console.log("✅ Taxonomy options loaded:", {
      domain: options.domain.length,
      kingdom: options.kingdom.length,
      phylum: options.phylum.length,
      klass: options.klass.length,
      order: options.order.length,
      family: options.family.length,
      genus: options.genus.length,
    });

    setCachedRequest(cacheKey, options);
    return options;
  } catch (error) {
    console.error("❌ Error fetching taxonomy options:", error);
    return {
      domain: [],
      kingdom: [],
      phylum: [],
      klass: [],
      order: [],
      family: [],
      genus: [],
    };
  }
};

export const fetchPlants = async (): Promise<Plant[]> => {
  const cacheKey = "allPlants";
  const cached = getCachedRequest(cacheKey);
  if (cached) return cached;

  try {
    const records = await pb.collection("species").getFullList<any>({
      expand: "genus,genus.family,genus.family.order,genus.family.order.class,genus.family.order.class.phylum,genus.family.order.class.phylum.kingdom,genus.family.order.class.phylum.kingdom.domain",
      requestKey: null, // Disable auto-cancellation
    });

    console.log("📦 Fetched", records.length, "species records");

    const plants: Plant[] = [];

    for (const record of records) {
      // Log first record details for debugging
      if (plants.length === 0) {
        console.log("🔍 FIRST RECORD DEBUG - Raw Fields:", {
          id: record.id,
          genus: record.genus,
          scientificName: record.scientificName,
          commonName: record.commonName,
          author: record.author,
          year: record.year,
          conservationStatus: record.conservationStatus,
          notes: record.notes,
          allKeys: Object.keys(record).filter(k => !k.startsWith('created') && !k.startsWith('updated') && !k.includes('expand')),
        });
        console.log("🔍 Expand structure:", {
          hasGenus: !!record.expand?.genus,
          genusName: record.expand?.genus?.name,
          hasFamily: !!record.expand?.genus?.expand?.family,
          familyName: record.expand?.genus?.expand?.family?.name,
          hasOrder: !!record.expand?.genus?.expand?.family?.expand?.order,
          hasClass: !!record.expand?.genus?.expand?.family?.expand?.order?.expand?.class,
        });
      }

      // Build image URL - try field first (primary image field), then image as fallback
      let imageUrl = "";
      if (record.field) {
        imageUrl = `https://bio-soc.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.field}`;
      } else if (record.image) {
        imageUrl = `https://bio-soc.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.image}`;
      }

      // Extract taxonomy from nested expand relationships
      let genusName = "";
      let genusId = "";
      let familyName = "";
      let orderName = "";
      let className = "";
      let phylumName = "";
      let kingdomName = "";
      let domainName = "";

      // Navigate through the expand chain: genus → family → order → class → phylum → kingdom → domain
      if (record.expand?.genus) {
        const genusRecord = Array.isArray(record.expand.genus) ? record.expand.genus[0] : record.expand.genus;
        genusName = genusRecord?.name || "";
        genusId = genusRecord?.id || "";
        console.log("✓ Found genus:", genusName);

        if (genusRecord?.expand?.family) {
          const familyRecord = Array.isArray(genusRecord.expand.family) ? genusRecord.expand.family[0] : genusRecord.expand.family;
          familyName = familyRecord?.name || "";
          console.log("✓ Found family:", familyName);

          if (familyRecord?.expand?.order) {
            const orderRecord = Array.isArray(familyRecord.expand.order) ? familyRecord.expand.order[0] : familyRecord.expand.order;
            orderName = orderRecord?.name || "";
            console.log("✓ Found order:", orderName);

            if (orderRecord?.expand?.class) {
              const classRecord = Array.isArray(orderRecord.expand.class) ? orderRecord.expand.class[0] : orderRecord.expand.class;
              className = classRecord?.name || "";
              console.log("✓ Found class:", className);

              if (classRecord?.expand?.phylum) {
                const phylumRecord = Array.isArray(classRecord.expand.phylum) ? classRecord.expand.phylum[0] : classRecord.expand.phylum;
                phylumName = phylumRecord?.name || "";
                console.log("✓ Found phylum:", phylumName);

                if (phylumRecord?.expand?.kingdom) {
                  const kingdomRecord = Array.isArray(phylumRecord.expand.kingdom) ? phylumRecord.expand.kingdom[0] : phylumRecord.expand.kingdom;
                  kingdomName = kingdomRecord?.name || "";
                  console.log("✓ Found kingdom:", kingdomName);
                  console.log("  Kingdom record expand keys:", Object.keys(kingdomRecord?.expand || {}));
                  console.log("  Kingdom record all fields:", Object.keys(kingdomRecord || {}).filter(k => !k.startsWith('created') && !k.startsWith('updated')));

                  if (kingdomRecord?.expand?.domain) {
                    const domainRecord = Array.isArray(kingdomRecord.expand.domain) ? kingdomRecord.expand.domain[0] : kingdomRecord.expand.domain;
                    domainName = domainRecord?.name || "";
                    console.log("✓ Found domain from expand:", domainName);
                  } else {
                    console.warn("⚠️ Domain not in expand. Kingdom has domain field?:", kingdomRecord?.domain);
                    // Fallback: fetch domain if it's just an ID
                    if (kingdomRecord?.domain && typeof kingdomRecord.domain === 'string') {
                      try {
                        const domainRecord = await pb.collection("domain").getOne(kingdomRecord.domain, { requestKey: null });
                        domainName = domainRecord.name || "";
                        console.log("✓ Found domain via fallback fetch:", domainName);
                      } catch (e) {
                        console.error("⚠️ Failed to fetch domain:", e);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      const plant: Plant = {
        id: record.id,
        commonName: record.commonName || "Unknown",
        scientificName: record.scientificName || "",
        image: imageUrl,
        genus: genusName,
        genusId: genusId,
        author: record.author || "",
        year: record.year || null,
        conservationStatus: record.conservationStatus || "",
        notes: record.notes || "",
        field: record.field || "",
        // Taxonomy fields - populated from relationships
        domain: domainName,
        kingdom: kingdomName,
        phylum: phylumName,
        klass: className,
        order: orderName,
        family: familyName,
        species: record.species || "",
        // Legacy fields
        morphology: record.morphology || "",
        ecology: record.ecology || "",
        distribution: record.distribution || "",
        uses: record.uses || "",
        description: record.description || "",
      };

      plants.push(plant);
      console.log("✅ Added plant:", plant.commonName, "| Taxonomy:", { 
        domain: plant.domain, 
        kingdom: plant.kingdom,
        phylum: plant.phylum,
        klass: plant.klass,
        order: plant.order,
        family: plant.family,
        genus: plant.genus,
      });
    }

    console.log("✅ Plants list loaded:", plants.length, "items");
    if (plants.length > 0) {
      console.log("🔍 First plant full data:", plants[0]);
      // Log taxonomy filter options available
      const taxonomyLevels = ["domain", "kingdom", "phylum", "klass", "order", "family", "genus"];
      const availableTaxonomy: Record<string, Set<string>> = {};
      const missingByLevel: Record<string, string[]> = {};
      
      taxonomyLevels.forEach(level => {
        availableTaxonomy[level] = new Set();
        missingByLevel[level] = [];
        plants.forEach(plant => {
          const value = plant[level as keyof Plant];
          if (value && typeof value === "string" && value.trim()) {
            availableTaxonomy[level].add(value);
          } else {
            // Track which plants are missing this taxonomy level
            if (missingByLevel[level].length < 3) { // Only track first 3 for brevity
              missingByLevel[level].push(plant.commonName);
            }
          }
        });
      });
      
      console.log("🔍 Available taxonomy filter options:", Object.fromEntries(
        Object.entries(availableTaxonomy).map(([level, values]) => [level, Array.from(values).length])
      ));
      console.log("📋 Full available options by level:", Object.fromEntries(
        Object.entries(availableTaxonomy).map(([level, values]) => [level, Array.from(values).sort()])
      ));
      console.log("⚠️ Plants missing taxonomy by level:", Object.fromEntries(
        Object.entries(missingByLevel).map(([level, plants]) => [level, plants.length > 0 ? plants : "None"])
      ));
    }
    setCachedRequest(cacheKey, plants);
    return plants;
  } catch (error) {
    if (error instanceof Error && !error.message.includes("aborted")) {
      console.error("Error fetching plants:", error);
    }
    return [];
  }
};

export const fetchPlantById = async (id: string): Promise<Plant | null> => {
  const cacheKey = `plant_${id}`;
  const cached = getCachedRequest(cacheKey);
  if (cached) return cached;

  try {
    const record = await pb.collection("species").getOne<any>(id, {
      expand: "genus_id",
      requestKey: null, // Disable auto-cancellation
    });

    console.log("📌 Fetching plant:", record.id);

    // Build image URL - try field first (primary image field), then image as fallback
    let imageUrl = "";
    if (record.field) {
      imageUrl = `https://bio-soc.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.field}`;
    } else if (record.image) {
      imageUrl = `https://bio-soc.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.image}`;
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
      species: record.species || "",
      // Legacy fields
      morphology: record.morphology || "",
      ecology: record.ecology || "",
      distribution: record.distribution || "",
      uses: record.uses || "",
      description: record.description || "",
    };

    console.log("✅ Plant loaded:", plant.commonName, "| Taxonomy:", { domain: plant.domain, kingdom: plant.kingdom, family: plant.family });
    setCachedRequest(cacheKey, plant);
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
      imageUrl = `https://bio-soc.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.image}`;
    } else if (record.field) {
      imageUrl = `https://bio-soc.nddu.edu.ph/pb-biosoc/api/files/species/${record.id}/${record.field}`;
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
