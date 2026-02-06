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

      const records = await pb.collection("class").getFullList<PlantClass>();
      setClasses(records);
    } catch {
      setError("❌ Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  return { classes, loading, error, fetchClasses, setClasses };
}
