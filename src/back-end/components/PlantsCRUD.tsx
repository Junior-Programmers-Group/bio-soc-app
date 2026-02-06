import { usePlantClassManager } from "../hooks/usePlantClassManager";

export default function PlantsCRUD() {
  const {
    classes,
    loading,
    error,
    name,
    description,
    phylumId,
    editingId,
    setName,
    setDescription,
    setPhylumId,
    setEditingId,
    createClass,
    updateClass,
    deleteClass,
    resetForm,
  } = usePlantClassManager();

  const handleAddOrUpdate = () => {
    if (!name.trim() || !description.trim() || !phylumId) {
      alert("Please fill out all fields.");
      return;
    }

    if (editingId) {
      updateClass(editingId, { name, description, phylum_id: phylumId });
    } else {
      createClass({ name, description, phylum_id: phylumId });
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🌱 Plant Class CRUD</h2>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Class name"
          style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="number"
          value={phylumId || ""}
          onChange={(e) => setPhylumId(Number(e.target.value))}
          placeholder="Phylum ID"
          style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={handleAddOrUpdate}
            disabled={loading}
            style={{ flex: 1, padding: "10px", fontSize: "16px", borderRadius: "4px", cursor: "pointer" }}
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              style={{ flex: 1, padding: "10px", fontSize: "16px", borderRadius: "4px", cursor: "pointer" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {classes.map((cls) => (
          <li
            key={cls.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              border: "1px solid #eee",
              borderRadius: "6px",
            }}
          >
            <div>
              <strong>{cls.name}</strong>
              <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
                {cls.description} (Phylum ID: {cls.phylum_id})
              </p>
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                type="button"
                onClick={() => {
                  setEditingId(cls.id);
                  setName(cls.name);
                  setDescription(cls.description);
                  setPhylumId(cls.phylum_id);
                }}
                disabled={loading}
                style={{ padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteClass(cls.id)}
                disabled={loading}
                style={{ padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
