import { usePlantClassManager } from "../hooks/usePlantClassManager";

export default function PlantsCRUD() {
  const {
    classes,
    isLoading,
    allErrors,
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
    setCreateError,
    setUpdateError,
  } = usePlantClassManager();

  const handleAddOrUpdate = () => {
    if (!name.trim()) {
      setCreateError("❌ Please enter a plant name");
      return;
    }
    if (!description.trim()) {
      setCreateError("❌ Please enter a description");
      return;
    }
    if (!phylumId || phylumId <= 0) {
      setCreateError("❌ Please enter a valid Phylum ID");
      return;
    }

    if (editingId) {
      updateClass(editingId, { name, description, phylum_id: phylumId });
    } else {
      createClass({ name, description, phylum_id: phylumId });
    }
  };

  const handleEdit = (cls: any) => {
    setEditingId(cls.id);
    setName(cls.name);
    setDescription(cls.description);
    setPhylumId(cls.phylum_id);
    setCreateError("");
    setUpdateError("");
  };

  const handleCancel = () => {
    resetForm();
    setCreateError("");
    setUpdateError("");
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🌱 Plant Class CRUD</h2>

      {allErrors && (
        <p style={{ color: "#c33", backgroundColor: "#fee", padding: "10px", borderRadius: "4px" }}>
          {allErrors}
        </p>
      )}

      {isLoading && (
        <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>Processing...</p>
      )}

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Plant name (e.g., Rose)"
          disabled={isLoading}
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            opacity: isLoading ? 0.6 : 1,
          }}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Plant description"
          disabled={isLoading}
          rows={3}
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontFamily: "Arial, sans-serif",
            opacity: isLoading ? 0.6 : 1,
          }}
        />
        <input
          type="number"
          value={phylumId || ""}
          onChange={(e) => setPhylumId(Number(e.target.value))}
          placeholder="Phylum ID (must be > 0)"
          disabled={isLoading}
          min="1"
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            opacity: isLoading ? 0.6 : 1,
          }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={handleAddOrUpdate}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: "16px",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
              backgroundColor: isLoading ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              fontWeight: "bold",
            }}
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "16px",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
                backgroundColor: isLoading ? "#ccc" : "#f44336",
                color: "white",
                border: "none",
                fontWeight: "bold",
              }}
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
              backgroundColor: editingId === cls.id ? "#f0f0f0" : "white",
            }}
          >
            <div>
              <strong>{cls.name}</strong>
              <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
                {cls.description}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>Phylum ID: {cls.phylum_id}</p>
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                type="button"
                onClick={() => handleEdit(cls)}
                disabled={isLoading}
                style={{
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  fontWeight: "bold",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteClass(cls.id)}
                disabled={isLoading}
                style={{
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  fontWeight: "bold",
                  opacity: isLoading ? 0.6 : 1,
                }}
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
