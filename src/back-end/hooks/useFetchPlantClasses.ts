import { useState } from "react";
import pb from "../db";
import type { PlantClass } from "../types/plantClass";

export function useFetchPlantClasses() {
  const [classes, setClasses] = useState<PlantClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");

      const records = await pb.collection("class").getFullList<PlantClass>({
        requestKey: null, // Disable auto-cancellation
      });

      setClasses(records);
      console.log("✅ Plants fetched successfully:", records);
    } catch (err: any) {
      const errorMessage = err?.response?.message || err?.message || "Failed to fetch plants";
      setError(`❌ ${errorMessage}`);
      console.error("Fetch error:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  return { classes, loading, error, fetchClasses, setClasses };
}
