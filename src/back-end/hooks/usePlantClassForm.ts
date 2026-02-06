import { useState } from "react";

export function usePlantClassForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phylumId, setPhylumId] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPhylumId(1);
    setEditingId(null);
  };

  return {
    name,
    description,
    phylumId,
    editingId,
    setName,
    setDescription,
    setPhylumId,
    setEditingId,
    resetForm,
  };
}
