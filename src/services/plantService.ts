import type { Plant } from "../types/plant";

export const fetchPlants = async (): Promise<Plant[]> => {
  try {
    const response = await fetch("http://localhost:5000/plants");

    if (!response.ok) throw new Error("Failed to fetch plants");

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};
