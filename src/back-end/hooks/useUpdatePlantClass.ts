import pb from "../db";

export function useUpdatePlantClass(fetchClasses: () => void, resetForm: () => void) {
  const updateClass = async (id: string, data: any) => {
    await pb.collection("class").update(id, data);
    resetForm();
    fetchClasses();
  };

  return { updateClass };
}
