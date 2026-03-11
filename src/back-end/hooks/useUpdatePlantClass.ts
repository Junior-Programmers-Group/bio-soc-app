import { useState } from "react";
import pb from "../db";

export function useUpdatePlantClass(fetchClasses: () => void, resetForm: () => void) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const updateClass = async (id: string, data: any) => {
    // Validation
    if (!id || !id.trim()) {
      setUpdateError("❌ No plant selected for update");
      return;
    }

    if (!data.name || !data.name.trim()) {
      setUpdateError("❌ Name is required");
      return;
    }

    if (!data.description || !data.description.trim()) {
      setUpdateError("❌ Description is required");
      return;
    }

    if (!data.phylum_id || data.phylum_id <= 0) {
      setUpdateError("❌ Valid Phylum ID is required");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError("");

      const record = await pb.collection("class").update(id, {
        name: data.name.trim(),
        description: data.description.trim(),
        phylum_id: parseInt(data.phylum_id),
      });

      console.log("✅ Plant updated successfully:", record);
      resetForm();
      await fetchClasses();
    } catch (error: any) {
      const errorMessage = error?.response?.message || error?.message || "Failed to update plant";
      setUpdateError(`❌ Error: ${errorMessage}`);
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateClass, isUpdating, updateError, setUpdateError };
}
