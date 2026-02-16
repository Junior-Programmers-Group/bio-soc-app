import { useEffect, useState } from "react";
import {
  getPlants,
  createPlant,
  updatePlant,
  deletePlant,
} from "../../services/adminService";
import type { PlantRecord } from "../../services/adminService";
import styles from "./ManagePlants.module.css";

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/300x250/2d5016/ffffff?text=Plant";

type FormStep = "basic" | "taxonomy" | "details" | "media";
type EditTab = "taxonomy" | "morphology" | "ecology" | "distribution" | "uses";

interface PlantFormData {
  name: string;
  scientificName: string;
  commonNames: string;
  imageFile: File | null;
  imagePreview: string;
  kingdom: string;
  order: string;
  family: string;
  subfamily: string;
  species: string;
  morphology: string;
  ecology: string;
  distribution: string;
  uses: string;
  phylum_id: string;
}

// STEP FIELD CONFIG
const STEP_FIELDS: Record<FormStep, Array<{ key: keyof PlantFormData; label: string; type: "text" | "textarea" | "number" }>> = {
  basic: [
    { key: "name", label: "Plant Name *", type: "text" },
    { key: "scientificName", label: "Scientific Name", type: "text" },
    { key: "commonNames", label: "Common Names", type: "text" },
    { key: "phylum_id", label: "Phylum ID", type: "number" },
  ],
  taxonomy: [
    { key: "kingdom", label: "Kingdom", type: "text" },
    { key: "order", label: "Order", type: "text" },
    { key: "family", label: "Family", type: "text" },
    { key: "subfamily", label: "Subfamily", type: "text" },
    { key: "species", label: "Species", type: "text" },
  ],
  details: [
    { key: "morphology", label: "Morphology", type: "textarea" },
    { key: "ecology", label: "Ecology", type: "textarea" },
    { key: "distribution", label: "Distribution", type: "textarea" },
    { key: "uses", label: "Uses", type: "textarea" },
  ],
  media: [],
};

// EDIT TABS CONFIG
const EDIT_TABS: Record<EditTab, Array<{ key: keyof PlantFormData; label: string; type: "text" | "textarea" }>> = {
  taxonomy: [
    { key: "kingdom", label: "Kingdom", type: "text" },
    { key: "order", label: "Order", type: "text" },
    { key: "family", label: "Family", type: "text" },
    { key: "subfamily", label: "Subfamily", type: "text" },
    { key: "species", label: "Species", type: "text" },
  ],
  morphology: [{ key: "morphology", label: "Morphology", type: "textarea" }],
  ecology: [{ key: "ecology", label: "Ecology", type: "textarea" }],
  distribution: [{ key: "distribution", label: "Distribution", type: "textarea" }],
  uses: [{ key: "uses", label: "Uses", type: "textarea" }],
};

// REUSABLE FORM FIELDS
const FormFields = ({
  fields,
  formData,
  setFormData,
}: {
  fields: Array<{ key: keyof PlantFormData; label: string; type: "text" | "textarea" | "number" }>;
  formData: PlantFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlantFormData>>;
}) => (
  <>
    {fields.map((f) => (
      <div key={f.key} className={styles.formGroup}>
        <label>{f.label}</label>
        {f.type === "textarea" ? (
          <textarea
            value={(formData[f.key] as string) || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
            }
          />
        ) : (
          <input
            type={f.type}
            value={(formData[f.key] as string) || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
            }
            required={f.key === "name"}
          />
        )}
      </div>
    ))}
  </>
);

export default function ManagePlants() {
  const [plants, setPlants] = useState<PlantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [editTab, setEditTab] = useState<EditTab>("taxonomy");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<PlantFormData>({
    name: "",
    scientificName: "",
    commonNames: "",
    imageFile: null,
    imagePreview: "",
    kingdom: "",
    order: "",
    family: "",
    subfamily: "",
    species: "",
    morphology: "",
    ecology: "",
    distribution: "",
    uses: "",
    phylum_id: "1",
  });

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPlants();
      setPlants(data);
    } catch (err: any) {
      // Ignore auto-cancellation errors
      if (err?.message?.includes("cancelled") || err?.isAbort) {
        return;
      }
      console.error("Error fetching plants:", err);
      setError(err.message || "Failed to fetch plants");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: ev.target?.result as string,
      }));
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous submissions
    if (uploading) return;
    
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      // Remove imageFile and imagePreview from payload - handle separately
      const { imageFile, imagePreview, ...dataWithoutFile } = formData;
      const payload = {
        ...dataWithoutFile,
        phylum_id: Number(formData.phylum_id) || 1,
      };

      if (editingId) {
        // Update existing plant
        await updatePlant(editingId, payload, imageFile || undefined);
        setSuccess("✓ Plant updated successfully!");
      } else {
        // Create new plant
        await createPlant(payload, imageFile || undefined);
        setSuccess("✓ Plant created successfully!");
      }

      setTimeout(() => {
        resetForm();
        fetchPlants();
      }, 1000);
    } catch (err: any) {
      if (!err?.message?.includes("cancelled")) {
        setError(err.message || "Failed to save plant");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plant?")) return;
    try {
      setError("");
      await deletePlant(id);
      fetchPlants();
    } catch (err: any) {
      if (!err?.message?.includes("cancelled")) {
        setError(err.message || "Failed to delete plant");
      }
    }
  };

  const handleEdit = (plant: PlantRecord) => {
    setFormData({
      name: plant.name || "",
      scientificName: plant.scientificName || "",
      commonNames: plant.commonNames || "",
      imageFile: null,
      imagePreview: plant.image
        ? `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/class/${plant.id}/${plant.image}`
        : "",
      kingdom: plant.kingdom || "",
      order: plant.order || "",
      family: plant.family || "",
      subfamily: plant.subfamily || "",
      species: plant.species || "",
      morphology: plant.morphology || "",
      ecology: plant.ecology || "",
      distribution: plant.distribution || "",
      uses: plant.uses || "",
      phylum_id: plant.phylum_id?.toString() || "1",
    });
    setEditingId(plant.id);
    setShowForm(true);
    setCurrentStep("basic");
    setEditTab("taxonomy");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      scientificName: "",
      commonNames: "",
      imageFile: null,
      imagePreview: "",
      kingdom: "",
      order: "",
      family: "",
      subfamily: "",
      species: "",
      morphology: "",
      ecology: "",
      distribution: "",
      uses: "",
      phylum_id: "1",
    });
    setEditingId(null);
    setShowForm(false);
    setCurrentStep("basic");
    setEditTab("taxonomy");
    setError("");
    setSuccess("");
  };

  const goToStep = (step: FormStep) => setCurrentStep(step);
  const goToNextStep = () => {
    const steps: FormStep[] = ["basic", "taxonomy", "details", "media"];
    const idx = steps.indexOf(currentStep);
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1]);
  };
  const goToPreviousStep = () => {
    const steps: FormStep[] = ["basic", "taxonomy", "details", "media"];
    const idx = steps.indexOf(currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1]);
  };

  if (loading) return <div className={styles.loading}>Loading plants...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Plants</h2>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Plant"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {/* CREATE FORM */}
      {showForm && !editingId && (
        <div className={styles.formContainer}>
          <div className={styles.formSteps}>
            {(["basic", "taxonomy", "details", "media"] as FormStep[]).map(
              (step, idx) => (
                <button
                  key={step}
                  className={`${styles.stepBtn} ${
                    currentStep === step ? styles.activeStep : ""
                  }`}
                  onClick={() => goToStep(step)}
                >
                  <span className={styles.stepNumber}>{idx + 1}</span>
                  <span className={styles.stepLabel}>{step.toUpperCase()}</span>
                </button>
              )
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {currentStep !== "media" ? (
              <FormFields
                fields={STEP_FIELDS[currentStep]}
                formData={formData}
                setFormData={setFormData}
              />
            ) : (
              <div className={styles.formGroup}>
                <label>Plant Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="preview"
                    className={styles.imagePreview}
                  />
                )}
              </div>
            )}

            <div className={styles.formActions}>
              <button 
                type="button" 
                onClick={goToPreviousStep} 
                disabled={currentStep === "basic"}
                className={styles.prevBtn}
              >
                ← Previous
              </button>
              {currentStep !== "media" ? (
                <button 
                  type="button" 
                  onClick={goToNextStep}
                  className={styles.nextBtn}
                >
                  Next →
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={uploading}
                  className={styles.submitBtn}
                >
                  {uploading ? "Uploading..." : "✓ Create Plant"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* EDIT FORM */}
      {showForm && editingId && (
        <div className={styles.editViewContainer}>
          <div className={styles.editCard}>
            <div className={styles.editImageSection}>
              <img
                src={formData.imagePreview || PLACEHOLDER_IMAGE}
                alt={formData.name}
                className={styles.editImage}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                id="editImageInput"
                className={styles.editImageInput}
              />
              <label htmlFor="editImageInput" className={styles.changeImageBtn}>
                📷 Change Image
              </label>
            </div>

            <div className={styles.editContent}>
              <h1>{formData.name}</h1>
              <em>{formData.scientificName || "Scientific name..."}</em>

              <div className={styles.editTabs}>
                {(Object.keys(EDIT_TABS) as EditTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEditTab(tab)}
                    className={`${styles.editTab} ${
                      editTab === tab ? styles.editTabActive : ""
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <FormFields
                  fields={EDIT_TABS[editTab]}
                  formData={formData}
                  setFormData={setFormData}
                />
                <div className={styles.editFormActions}>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={uploading}
                    className={styles.saveBtn}
                  >
                    {uploading ? "Uploading..." : "✓ Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PLANTS GRID */}
      <div className={styles.plantsGrid}>
        {plants.length === 0 && <p>No plants found</p>}
        {plants.map((plant) => (
          <div key={plant.id} className={styles.plantCard}>
            <img
              src={
                plant.image
                  ? `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/class/${plant.id}/${plant.image}`
                  : PLACEHOLDER_IMAGE
              }
              alt={plant.name}
            />
            <h3>{plant.name}</h3>
            <p>{plant.description || ""}</p>
            <button onClick={() => handleEdit(plant)}>Edit</button>
            <button onClick={() => handleDelete(plant.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
