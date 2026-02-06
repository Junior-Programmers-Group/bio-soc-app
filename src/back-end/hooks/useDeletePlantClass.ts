import pb from "../db";

export function useDeletePlantClass(fetchClasses: () => void) {
  const deleteClass = async (id: string) => {
    await pb.collection("class").delete(id);
    fetchClasses();
  };

  return { deleteClass };
}
