import { useState } from "react";
import pb from "../db";

export function useDeletePlantClass(fetchClasses: () => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const deleteClass = async (id: string) => {
    // Confirmation dialog
    if (!confirm("Are you sure you want to delete this plant? This cannot be undone.")) {
      return;
    }

    if (!id || !id.trim()) {
      setDeleteError("❌ No plant selected for deletion");
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      await pb.collection("class").delete(id);
      console.log("✅ Plant deleted successfully");
      await fetchClasses();
    } catch (error: any) {
      const errorMessage = error?.response?.message || error?.message || "Failed to delete plant";
      setDeleteError(`❌ Error: ${errorMessage}`);
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteClass, isDeleting, deleteError, setDeleteError };
}
