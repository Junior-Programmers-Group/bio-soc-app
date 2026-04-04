import pb from "../back-end/db";
import type { RecordModel } from "pocketbase";
import { generateQRCodeBlob } from "./qrCodeService";

export interface PlantRecord extends RecordModel {
  // Basic Information - from species collection
  commonName: string;
  scientificName?: string;
  description?: string;
  image?: string;  // May be populated from field
  field?: string;  // Actual image field in PocketBase
  
  // Species Metadata
  genus?: string;
  author?: string;
  year?: number;
  conservationStatus?: string;
  notes?: string;
  
  // QR Code
  qr_code?: string;
  
  // Taxonomy - auto-populated from genus
  kingdom?: string;
  phylum?: string;
  klass?: string;  // Class (renamed to avoid keyword)
  order?: string;
  family?: string;
  species?: string;
  
  // Plant Details - legacy fields
  morphology?: string;
  ecology?: string;
  distribution?: string;
  uses?: string;
  
  // References
  phylum_id?: number;
}

export interface UserRecord extends RecordModel {
  email: string;
  verified: boolean;
  role?: string;
}

// Helper function to safely get or create details for a plant
async function syncPlantDetails(
  plantId: string,
  detailsData: {
    morphology: string;
    ecology: string;
    distribution: string;
    uses: string;
  }
): Promise<string> {
  try {
    console.log("🔄 Syncing details for plant:", plantId);

    // Try to find existing details record
    const detailsList = await pb.collection("details").getList(1, 1, {
      filter: `species = "${plantId}"`,
      requestKey: null,
    });

    if (detailsList.items && detailsList.items.length > 0) {
      // Update existing details
      const existingDetailsId = detailsList.items[0].id;
      console.log("📝 Updating existing details record:", existingDetailsId);

      await pb
        .collection("details")
        .update(existingDetailsId, {
          ...detailsData,
          species: plantId, // Ensure species relationship is maintained
        });

      console.log("✓ Details updated successfully:", existingDetailsId);
      return existingDetailsId;
    } else {
      // Create new details record
      console.log("✨ Creating new details record for plant:", plantId);

      const newDetails = await pb.collection("details").create({
        species: plantId,
        ...detailsData,
      });

      console.log("✓ Details created successfully:", newDetails.id);
      return newDetails.id;
    }
  } catch (error) {
    console.warn("⚠️  Error syncing plant details:", error);
    throw error;
  }
}

// 🌿 PLANTS MANAGEMENT
export async function getPlants(): Promise<PlantRecord[]> {
  try {
    const plants = await pb.collection("species").getFullList<PlantRecord>({
      requestKey: null, // Disable auto-cancellation
    });

    console.log(`📥 Fetched ${plants.length} plants from species collection`);

    // Fetch details for each plant and merge
    const plantsWithDetails = await Promise.all(
      plants.map(async (plant) => {
        try {
          // Query the details collection for this plant
          const detailsList = await pb.collection("details").getList(1, 1, {
            filter: `species = "${plant.id}"`,
            requestKey: null,
          });

          if (detailsList.items && detailsList.items.length > 0) {
            const details = detailsList.items[0] as any;
            console.log(`✓ Details loaded for plant ${plant.commonName} (${plant.id}):`, {
              morphology: details.morphology ? `${details.morphology.substring(0, 30)}...` : "empty",
              ecology: details.ecology ? `${details.ecology.substring(0, 30)}...` : "empty",
              distribution: details.distribution ? `${details.distribution.substring(0, 30)}...` : "empty",
              uses: details.uses ? `${details.uses.substring(0, 30)}...` : "empty",
            });
            return {
              ...plant,
              morphology: details.morphology || "",
              ecology: details.ecology || "",
              distribution: details.distribution || "",
              uses: details.uses || "",
            };
          } else {
            console.log(`ℹ️  No details record found for plant ${plant.commonName} (${plant.id})`);
            return plant;
          }
        } catch (detailsError: any) {
          console.warn(`⚠️  Error loading details for plant ${plant.id}:`, detailsError?.message);
          return plant;
        }
      })
    );

    return plantsWithDetails;
  } catch (error) {
    if (error instanceof Error && !error.message.includes('aborted')) {
      console.error("Error fetching plants from species:", error);
    }
    throw error;
  }
}

export async function createPlant(
  data: Partial<PlantRecord>,
  imageFile?: File
): Promise<PlantRecord> {
  try {
    // First create the plant without QR code to get the ID
    const formData = new FormData();
    
    // Add all text fields for species collection
    formData.append("commonName", data.commonName || "");
    formData.append("scientificName", data.scientificName || "");
    formData.append("description", data.description || data.commonName || "");
    formData.append("genus", data.genus || "");
    formData.append("author", data.author || "");
    formData.append("year", String(data.year || ""));
    formData.append("conservationStatus", data.conservationStatus || "");
    formData.append("notes", data.notes || "");
    // Taxonomy fields - auto-populated from genus
    formData.append("kingdom", data.kingdom || "");
    formData.append("phylum", (data as any).phylum || "");
    formData.append("klass", (data as any).klass || "");
    formData.append("order", data.order || "");
    formData.append("family", data.family || "");
    formData.append("species", data.species || "");
    formData.append("morphology", data.morphology || "");
    formData.append("ecology", data.ecology || "");
    formData.append("distribution", data.distribution || "");
    formData.append("uses", data.uses || "");
    formData.append("phylum_id", String(data.phylum_id || 1));
    
    // Add image file if provided
    if (imageFile) {
      formData.append("field", imageFile, imageFile.name);
      console.log("📸 Uploading image file:", imageFile.name);
    }

    const record = await pb.collection("species").create<PlantRecord>(formData);
    console.log("✓ Plant created successfully in species:", record);
    
    // Create details record using helper
    try {
      const detailsId = await syncPlantDetails(record.id, {
        morphology: data.morphology || "",
        ecology: data.ecology || "",
        distribution: data.distribution || "",
        uses: data.uses || "",
      });
      console.log("✓ Plant created with details:", { plantId: record.id, detailsId });
    } catch (detailsError) {
      console.warn("⚠️  Details creation failed, but plant was created:", detailsError);
    }
    
    // Now generate and upload QR code
    try {
      const qrCodeBlob = await generateQRCodeBlob({
        plantId: record.id,
        width: 400,
        margin: 2,
      });
      
      const qrFormData = new FormData();
      qrFormData.append(
        "qr_code",
        qrCodeBlob,
        `${record.id}_qr.png`
      );
      
      const updatedRecord = await pb
        .collection("species")
        .update<PlantRecord>(record.id, qrFormData);
      console.log("✓ QR code generated and saved:", updatedRecord);
      return updatedRecord;
    } catch (qrError) {
      console.warn("Warning: QR code generation failed, but plant was created:", qrError);
      return record; // Return plant even if QR code fails
    }
  } catch (error) {
    console.error("Error creating plant:", error);
    throw error;
  }
}

export async function updatePlant(
  id: string,
  data: Partial<PlantRecord>,
  imageFile?: File
): Promise<PlantRecord> {
  try {
    // If there's an image file, use FormData
    if (imageFile) {
      const formData = new FormData();
      
      formData.append("commonName", data.commonName || "");
      formData.append("scientificName", data.scientificName || "");
      formData.append("description", data.description || data.commonName || "");
      formData.append("genus", data.genus || "");
      formData.append("author", data.author || "");
      formData.append("year", String(data.year || ""));
      formData.append("conservationStatus", data.conservationStatus || "");
      formData.append("notes", data.notes || "");
      // Taxonomy fields - auto-populated from genus
      formData.append("kingdom", data.kingdom || "");
      formData.append("phylum", (data as any).phylum || "");
      formData.append("klass", (data as any).klass || "");
      formData.append("order", data.order || "");
      formData.append("family", data.family || "");
      formData.append("species", data.species || "");
      formData.append("morphology", data.morphology || "");
      formData.append("ecology", data.ecology || "");
      formData.append("distribution", data.distribution || "");
      formData.append("uses", data.uses || "");
      formData.append("phylum_id", String(data.phylum_id || 1));
      formData.append("field", imageFile, imageFile.name);
      console.log("📸 Uploading image file for update:", imageFile.name);
      
      const record = await pb.collection("species").update<PlantRecord>(id, formData);
      console.log("✓ Plant updated successfully in species:", record);
      
      // Update or create details record using helper
      try {
        await syncPlantDetails(id, {
          morphology: data.morphology || "",
          ecology: data.ecology || "",
          distribution: data.distribution || "",
          uses: data.uses || "",
        });
      } catch (detailsError) {
        console.warn("⚠️  Details sync failed:", detailsError);
      }
      
      // Regenerate QR code
      try {
        const qrCodeBlob = await generateQRCodeBlob({
          plantId: record.id,
          width: 400,
          margin: 2,
        });
        
        const qrFormData = new FormData();
        qrFormData.append("qr_code", qrCodeBlob, `${record.id}_qr.png`);
        
        const updatedWithQR = await pb
          .collection("species")
          .update<PlantRecord>(record.id, qrFormData);
        return updatedWithQR;
      } catch (qrError) {
        console.warn("Warning: QR code regeneration failed:", qrError);
        return record;
      }
    } else {
      // No image file, use JSON
      const payload = {
        commonName: data.commonName || "",
        scientificName: data.scientificName || "",
        description: data.description || data.commonName || "",
        genus: data.genus || "",
        author: data.author || "",
        year: data.year || null,
        conservationStatus: data.conservationStatus || "",
        notes: data.notes || "",
        // Taxonomy fields - auto-populated from genus
        kingdom: data.kingdom || "",
        phylum: (data as any).phylum || "",
        klass: (data as any).klass || "",
        order: data.order || "",
        family: data.family || "",
        species: data.species || "",
        morphology: data.morphology || "",
        ecology: data.ecology || "",
        distribution: data.distribution || "",
        uses: data.uses || "",
        phylum_id: Number(data.phylum_id) || 1,
      };

      const record = await pb.collection("species").update<PlantRecord>(id, payload);
      console.log("✓ Plant updated successfully in species:", record);
      
      // Update or create details record using helper
      try {
        await syncPlantDetails(id, {
          morphology: data.morphology || "",
          ecology: data.ecology || "",
          distribution: data.distribution || "",
          uses: data.uses || "",
        });
      } catch (detailsError) {
        console.warn("⚠️  Details sync failed:", detailsError);
      }
      
      // Regenerate QR code
      try {
        const qrCodeBlob = await generateQRCodeBlob({
          plantId: record.id,
          width: 400,
          margin: 2,
        });
        
        const qrFormData = new FormData();
        qrFormData.append("qr_code", qrCodeBlob, `${record.id}_qr.png`);
        
        const updatedWithQR = await pb
          .collection("species")
          .update<PlantRecord>(record.id, qrFormData);
        return updatedWithQR;
      } catch (qrError) {
        console.warn("Warning: QR code regeneration failed:", qrError);
        return record;
      }
    }
  } catch (error) {
    console.error("Error updating plant:", error);
    throw error;
  }
}

export async function deletePlant(id: string): Promise<void> {
  try {
    // First, find and delete any associated details records
    const detailsList = await pb.collection("details").getList(1, 50, {
      filter: `species = "${id}"`,
      requestKey: null,
    });

    if (detailsList.items && detailsList.items.length > 0) {
      for (const detail of detailsList.items) {
        await pb.collection("details").delete(detail.id);
        console.log("✓ Plant details deleted:", detail.id);
      }
    }

    // Then delete the plant species record
    await pb.collection("species").delete(id);
    console.log("✓ Plant deleted successfully from species");
  } catch (error) {
    console.error("Error deleting plant:", error);
    throw error;
  }
}

// 👥 USERS MANAGEMENT
export async function getUsers(): Promise<UserRecord[]> {
  try {
    return await pb.collection("users").getFullList<UserRecord>();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<UserRecord> {
  try {
    return await pb.collection("users").update<UserRecord>(userId, { role });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await pb.collection("users").delete(userId);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// 📊 ANALYTICS
export async function getAnalyticsData() {
  try {
    const totalPlants = (await pb.collection("species").getList(1, 1)).totalItems;
    const totalUsers = (await pb.collection("users").getFullList()) as UserRecord[];
    
    return {
      totalPlants: totalPlants,
      totalUsers: totalUsers.length,
      verifiedUsers: totalUsers.filter((u) => u.verified).length,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
}

// 📸 FILE UPLOAD
export async function uploadPlantImage(
  file: File
): Promise<File> {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB");
    }
    
    console.log("✓ Image file validated and ready for upload");
    return file;
  } catch (error) {
    console.error("Error validating image:", error);
    throw error;
  }
}


