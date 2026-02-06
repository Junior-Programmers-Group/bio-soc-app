import pb from "../db";

export function useCreatePlantClass(fetchClasses: () => void, resetForm: () => void) {
  const createClass = async (data: any) => {
    await pb.collection("class").create(data);
    resetForm();
    fetchClasses();
  };

  return { createClass };
}
