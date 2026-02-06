import { useEffect } from "react";
import { useFetchPlantClasses } from "./useFetchPlantClasses";
import { usePlantClassForm } from "./usePlantClassForm";
import { useCreatePlantClass } from "./useCreatePlantClass";
import { useUpdatePlantClass } from "./useUpdatePlantClass";
import { useDeletePlantClass } from "./useDeletePlantClass";

export function usePlantClassManager() {
  const fetchHook = useFetchPlantClasses();
  const formHook = usePlantClassForm();

  const createHook = useCreatePlantClass(fetchHook.fetchClasses, formHook.resetForm);
  const updateHook = useUpdatePlantClass(fetchHook.fetchClasses, formHook.resetForm);
  const deleteHook = useDeletePlantClass(fetchHook.fetchClasses);

  useEffect(() => {
    fetchHook.fetchClasses();
  }, []);

  return {
    ...fetchHook,
    ...formHook,
    ...createHook,
    ...updateHook,
    ...deleteHook,
  };
}
