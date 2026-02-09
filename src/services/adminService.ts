import pb from "../back-end/db";
import type { RecordModel } from "pocketbase";

export interface PlantRecord extends RecordModel {
  // Basic Information
  name: string;
  scientificName?: string;
  commonNames?: string;
  description?: string;
  imageUrl?: string;
  
  // Taxonomy
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
  
  // Legacy fields (for backward compatibility)
  commonName?: string;
  image?: string;
}

export interface UserRecord extends RecordModel {
  email: string;
  verified: boolean;
  role?: string;
}

// 🌿 PLANTS MANAGEMENT
export async function getPlants(): Promise<PlantRecord[]> {
  try {
    return await pb.collection("class").getFullList<PlantRecord>();
  } catch (error) {
    console.error("Error fetching plants:", error);
    throw error;
  }
}

export async function createPlant(data: Partial<PlantRecord>): Promise<PlantRecord> {
  try {
    return await pb.collection("class").create<PlantRecord>(data);
  } catch (error) {
    console.error("Error creating plant:", error);
    throw error;
  }
}

export async function updatePlant(
  id: string,
  data: Partial<PlantRecord>
): Promise<PlantRecord> {
  try {
    return await pb.collection("class").update<PlantRecord>(id, data);
  } catch (error) {
    console.error("Error updating plant:", error);
    throw error;
  }
}

export async function deletePlant(id: string): Promise<void> {
  try {
    await pb.collection("class").delete(id);
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
    const totalPlants = await pb.collection("class").getFullList<PlantRecord>();
    const totalUsers = await pb.collection("users").getFullList<UserRecord>();
    
    return {
      totalPlants: totalPlants.length,
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
  file: File,
  recordId?: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    
    if (recordId) {
      // Upload to existing record
      const record = await pb.collection("class").update<PlantRecord>(recordId, formData);
      return pb.getFileUrl(record, file.name);
    } else {
      // For new records: just return the file name, to be used in plant creation
      // The file will be uploaded together with plant data
      return file.name;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
