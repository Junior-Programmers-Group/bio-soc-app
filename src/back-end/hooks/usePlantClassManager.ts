import { useEffect, useState } from "react";
import { useFetchPlantClasses } from "./useFetchPlantClasses";
import { usePlantClassForm } from "./usePlantClassForm";
import { useCreatePlantClass } from "./useCreatePlantClass";
import { useUpdatePlantClass } from "./useUpdatePlantClass";
import { useDeletePlantClass } from "./useDeletePlantClass";

export function usePlantClassManager() {
  const fetchHook = useFetchPlantClasses();
  const formHook = usePlantClassForm();
  const [allErrors, setAllErrors] = useState("");

  const createHook = useCreatePlantClass(fetchHook.fetchClasses, formHook.resetForm);
  const updateHook = useUpdatePlantClass(fetchHook.fetchClasses, formHook.resetForm);
  const deleteHook = useDeletePlantClass(fetchHook.fetchClasses);

  // Combine all errors for display
  useEffect(() => {
    const currentError =
      fetchHook.error || createHook.createError || updateHook.updateError || deleteHook.deleteError;
    setAllErrors(currentError);
  }, [fetchHook.error, createHook.createError, updateHook.updateError, deleteHook.deleteError]);

  useEffect(() => {
    fetchHook.fetchClasses();
  }, []);

  const isLoading =
    fetchHook.loading || createHook.isCreating || updateHook.isUpdating || deleteHook.isDeleting;

  return {
    ...fetchHook,
    ...formHook,
    ...createHook,
    ...updateHook,
    ...deleteHook,
    allErrors,
    isLoading,
  };
}
