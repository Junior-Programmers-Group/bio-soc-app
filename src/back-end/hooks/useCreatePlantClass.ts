import { useState } from "react";
import pb from "../db";

export function useCreatePlantClass(fetchClasses: () => void, resetForm: () => void) {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const createClass = async (data: any) => {
    // Validation
    if (!data.name || !data.name.trim()) {
      setCreateError("❌ Name is required");
      return;
    }

    if (!data.description || !data.description.trim()) {
      setCreateError("❌ Description is required");
      return;
    }

    if (!data.phylum_id || data.phylum_id <= 0) {
      setCreateError("❌ Valid Phylum ID is required");
      return;
    }

    try {
      setIsCreating(true);
      setCreateError("");

      const record = await pb.collection("class").create({
        name: data.name.trim(),
        description: data.description.trim(),
        phylum_id: parseInt(data.phylum_id),
      });

      console.log("✅ Plant created successfully:", record);
      resetForm();
      await fetchClasses();
    } catch (error: any) {
      const errorMessage = error?.response?.message || error?.message || "Failed to create plant";
      setCreateError(`❌ Error: ${errorMessage}`);
      console.error("Create error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return { createClass, isCreating, createError, setCreateError };
}
