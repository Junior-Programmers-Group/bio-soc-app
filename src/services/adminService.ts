import pb from "../back-end/db";
import type { RecordModel } from "pocketbase";
import { generateQRCodeBlob } from "./qrCodeService";

export interface PlantRecord extends RecordModel {
  // Basic Information
  name: string;
  scientificName?: string;
  commonNames?: string;
  description?: string;
  image?: string;
  
  // QR Code
  qr_code?: string;
  
  // Taxonomy - flat structure for now
  kingdom?: string;
  order?: string;
  family?: string;
  subfamily?: string;
  species?: string;
  
  // Plant Details
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

// 🌿 PLANTS MANAGEMENT
export async function getPlants(): Promise<PlantRecord[]> {
  try {
    return await pb.collection("class").getFullList<PlantRecord>({
      requestKey: null, // Disable auto-cancellation
    });
  } catch (error) {
    if (error instanceof Error && !error.message.includes('aborted')) {
      console.error("Error fetching plants:", error);
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
    
    // Add all text fields
    formData.append("name", data.name || "");
    formData.append("scientificName", data.scientificName || "");
    formData.append("commonNames", data.commonNames || "");
    formData.append("description", data.description || data.name || "");
    formData.append("kingdom", data.kingdom || "");
    formData.append("order", data.order || "");
    formData.append("family", data.family || "");
    formData.append("subfamily", data.subfamily || "");
    formData.append("species", data.species || "");
    formData.append("morphology", data.morphology || "");
    formData.append("ecology", data.ecology || "");
    formData.append("distribution", data.distribution || "");
    formData.append("uses", data.uses || "");
    formData.append("phylum_id", String(data.phylum_id || 1));
    
    // Add image file if provided
    if (imageFile) {
      formData.append("image", imageFile, imageFile.name);
    }

    const record = await pb.collection("class").create<PlantRecord>(formData);
    console.log("✓ Plant created successfully:", record);
    
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
        .collection("class")
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
      
      formData.append("name", data.name || "");
      formData.append("scientificName", data.scientificName || "");
      formData.append("commonNames", data.commonNames || "");
      formData.append("description", data.description || data.name || "");
      formData.append("kingdom", data.kingdom || "");
      formData.append("order", data.order || "");
      formData.append("family", data.family || "");
      formData.append("subfamily", data.subfamily || "");
      formData.append("species", data.species || "");
      formData.append("morphology", data.morphology || "");
      formData.append("ecology", data.ecology || "");
      formData.append("distribution", data.distribution || "");
      formData.append("uses", data.uses || "");
      formData.append("phylum_id", String(data.phylum_id || 1));
      formData.append("image", imageFile, imageFile.name);
      
      const record = await pb.collection("class").update<PlantRecord>(id, formData);
      console.log("✓ Plant updated successfully:", record);
      
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
          .collection("class")
          .update<PlantRecord>(record.id, qrFormData);
        return updatedWithQR;
      } catch (qrError) {
        console.warn("Warning: QR code regeneration failed:", qrError);
        return record;
      }
    } else {
      // No image file, use JSON
      const payload = {
        name: data.name || "",
        scientificName: data.scientificName || "",
        commonNames: data.commonNames || "",
        description: data.description || data.name || "",
        kingdom: data.kingdom || "",
        order: data.order || "",
        family: data.family || "",
        subfamily: data.subfamily || "",
        species: data.species || "",
        morphology: data.morphology || "",
        ecology: data.ecology || "",
        distribution: data.distribution || "",
        uses: data.uses || "",
        phylum_id: Number(data.phylum_id) || 1,
      };

      const record = await pb.collection("class").update<PlantRecord>(id, payload);
      console.log("✓ Plant updated successfully:", record);
      
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
          .collection("class")
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
    await pb.collection("class").delete(id);
    console.log("✓ Plant deleted successfully");
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
    const totalPlants = (await pb.collection("class").getList(1, 1)).totalItems;
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


