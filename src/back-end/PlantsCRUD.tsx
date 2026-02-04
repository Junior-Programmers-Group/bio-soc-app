import { useEffect, useState } from "react";
import pb from "./db";
import type { RecordModel } from "pocketbase";

type PlantClass = RecordModel & {
  name: string;
  description: string;
  phylum_id: number;
};

export default function PlantsCRUD() {
  const [classes, setClasses] = useState<PlantClass[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phylumId, setPhylumId] = useState<number>(1);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 FETCH
  const fetchClasses = async () => {
  try {
    setLoading(true)
    setError("");

    const records = await pb.collection("class").getFullList<PlantClass>();

    setClasses(records);
  } catch (err: any) {
    if (!err?.isAbort) {
      console.error("Fetch error:", err);
      setError("❌ Cannot fetch class records");
    }
  } finally {
    setLoading(false);
  }
};


  // 🔹 CREATE
  const createClass = async () => {
    if (!name.trim()) return;

    try {
      setError("");

      await pb.collection("class").create({
        name,
        description,
        phylum_id: Number(phylumId),
      });

      resetForm();
      fetchClasses();
    } catch (err: any) {
      console.error("Create error:", err);
      setError(err.message || "❌ Failed to create class");
    }
  };

  // 🔹 UPDATE
  const updateClass = async () => {
    if (!editingId) return;

    try {
      setError("");

      await pb.collection("class").update(editingId, {
        name,
        description,
        phylum_id: Number(phylumId),
      });

      resetForm();
      fetchClasses();
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "❌ Failed to update class");
    }
  };

  // 🔹 DELETE
  const deleteClass = async (id: string) => {
    try {
      setError("");

      await pb.collection("class").delete(id);
      fetchClasses();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "❌ Failed to delete class");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPhylumId(1);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", fontFamily: "Arial" }}>
      <h2>🌱 Plant Class CRUD</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* FORM */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Class name"
          style={{ padding: "6px" }}
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          style={{ padding: "6px" }}
        />

        <input
          type="number"
          value={phylumId}
          onChange={(e) => setPhylumId(Number(e.target.value))}
          placeholder="Phylum ID"
          style={{ padding: "6px" }}
        />

        {editingId ? (
          <button onClick={updateClass}>Update</button>
        ) : (
          <button onClick={createClass}>Add</button>
        )}

        {editingId && (
          <button onClick={resetForm} style={{ background: "#ccc" }}>
            Cancel
          </button>
        )}
      </div>

      <hr />

      {/* LIST */}
      {classes.length === 0 && !loading && <p>No records found.</p>}

      <ul style={{ padding: 0 }}>
        {classes.map((cls) => (
          <li
            key={cls.id}
            style={{
              listStyle: "none",
              marginBottom: "10px",
              border: "1px solid #ddd",
              padding: "8px",
            }}
          >
            <strong>{cls.name}</strong>
            <p>{cls.description}</p>
            <small>Phylum ID: {cls.phylum_id}</small>

            <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
              <button
                onClick={() => {
                  setEditingId(cls.id);
                  setName(cls.name);
                  setDescription(cls.description);
                  setPhylumId(cls.phylum_id);
                }}
              >
                Edit
              </button>

              <button onClick={() => deleteClass(cls.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
