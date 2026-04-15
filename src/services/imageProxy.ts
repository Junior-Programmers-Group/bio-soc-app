import pb from "../back-end/db";

/**
 * Get image URL for a plant record
 * Uses PocketBase SDK to generate proper URLs that handle CORS
 */
export const getPlantImageUrl = (plant: any): string => {
  if (!plant) return "";

  try {
    // Try to get URL using PocketBase's built-in method
    // This handles authentication and CORS properly
    if (plant.image || plant.field) {
      const imageField = plant.image || plant.field;
      
      // Use PocketBase's getURL method which properly handles CORS
      const url = pb.files.getURL(plant, imageField);
      
      // Ensure it's a complete URL
      if (url && !url.startsWith("http")) {
        return pb.baseUrl + url;
      }
      return url;
    }
  } catch (error) {
    console.warn("Error getting image URL:", error);
  }

  return "";
};

/**
 * Fetch and cache image data as blob for CORS-free display
 */
export const getImageAsDataUrl = async (plant: any): Promise<string> => {
  if (!plant) return "";

  try {
    const imageUrl = getPlantImageUrl(plant);
    if (!imageUrl) return "";

    // Try to fetch with credentials to avoid CORS
    const response = await fetch(imageUrl, {
      credentials: "include", // Send cookies to allow authentication
    });

    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.status}`);
      return "";
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn("Error fetching image as data URL:", error);
    return "";
  }
};

/**
 * Get image URL with fallback handling
 */
export const getSafeImageUrl = (plant: any, fallback?: string): string => {
  const imageUrl = getPlantImageUrl(plant);
  return imageUrl || fallback || "";
};
