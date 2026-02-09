import { useEffect, useState } from "react";
import { getPlants, createPlant, updatePlant, deletePlant, uploadPlantImage } from "../../services/adminService";
import type { PlantRecord } from "../../services/adminService";
import styles from "./ManagePlants.module.css";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x250/2d5016/ffffff?text=Plant";

type FormStep = "basic" | "taxonomy" | "details" | "media";

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

type EditTab = "taxonomy" | "morphology" | "ecology" | "distribution" | "uses";

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
      setError(err.message || "Failed to fetch plants");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          imageFile: file,
          imagePreview: e.target?.result as string,
        });
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted - editingId:", editingId, "formData:", formData);
    
    try {
      setError("");
      setSuccess("");
      setUploading(true);

      let imageFileName = "";
      
      // Upload image if a new file is selected
      if (formData.imageFile) {
        try {
          console.log("Uploading image...");
          imageFileName = await uploadPlantImage(formData.imageFile, editingId || undefined);
          console.log("Image uploaded:", imageFileName);
        } catch (err: any) {
          console.error("Image upload failed:", err);
          setError("Failed to upload image: " + err.message);
          setUploading(false);
          return;
        }
      }

      const plantData = {
        name: formData.name,
        scientificName: formData.scientificName,
        commonNames: formData.commonNames,
        kingdom: formData.kingdom,
        order: formData.order,
        family: formData.family,
        subfamily: formData.subfamily,
        species: formData.species,
        morphology: formData.morphology,
        ecology: formData.ecology,
        distribution: formData.distribution,
        uses: formData.uses,
        phylum_id: Number(formData.phylum_id),
        ...(imageFileName && { image: imageFileName }),
      };

      console.log("Saving plant data:", plantData);

      if (editingId) {
        console.log("Updating plant with ID:", editingId);
        await updatePlant(editingId, plantData);
        console.log("Plant updated successfully");
        setSuccess("✓ Plant updated successfully!");
      } else {
        console.log("Creating new plant");
        await createPlant(plantData);
        console.log("Plant created successfully");
        setSuccess("✓ Plant created successfully!");
      }
      
      setUploading(false);
      
      // Close form after a short delay to show success message
      setTimeout(() => {
        resetForm();
        fetchPlants();
      }, 1000);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save plant");
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this plant?")) {
      try {
        setError("");
        await deletePlant(id);
        fetchPlants();
      } catch (err: any) {
        setError(err.message || "Failed to delete plant");
      }
    }
  };

  const handleEdit = (plant: PlantRecord) => {
    setFormData({
      name: plant.name,
      scientificName: plant.scientificName || "",
      commonNames: plant.commonNames || "",
      imageFile: null,
      imagePreview: plant.image ? `https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/class/${plant.id}/${plant.image}` : "",
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
    setError("");
    setSuccess("");
  };

  const goToStep = (step: FormStep) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    const steps: FormStep[] = ["basic", "taxonomy", "details", "media"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const steps: FormStep[] = ["basic", "taxonomy", "details", "media"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
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

      {showForm && !editingId && (
        <div className={styles.formContainer}>
          <div className={styles.formSteps}>
            <button
              className={`${styles.stepBtn} ${currentStep === "basic" ? styles.activeStep : ""}`}
              onClick={() => goToStep("basic")}
            >
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Basic Info</span>
            </button>
            <div className={styles.stepLine}></div>
            <button
              className={`${styles.stepBtn} ${currentStep === "taxonomy" ? styles.activeStep : ""}`}
              onClick={() => goToStep("taxonomy")}
            >
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Taxonomy</span>
            </button>
            <div className={styles.stepLine}></div>
            <button
              className={`${styles.stepBtn} ${currentStep === "details" ? styles.activeStep : ""}`}
              onClick={() => goToStep("details")}
            >
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepLabel}>Details</span>
            </button>
            <div className={styles.stepLine}></div>
            <button
              className={`${styles.stepBtn} ${currentStep === "media" ? styles.activeStep : ""}`}
              onClick={() => goToStep("media")}
            >
              <span className={styles.stepNumber}>4</span>
              <span className={styles.stepLabel}>Media</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {currentStep === "basic" && (
              <div className={styles.formStep}>
                <h3>Basic Information</h3>
                <div className={styles.formGroup}>
                  <label>Plant Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., River Tamarind"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Scientific Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Leucaena leucocephala"
                    value={formData.scientificName}
                    onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Common Names</label>
                  <input
                    type="text"
                    placeholder="e.g., white leadtree, white popinac"
                    value={formData.commonNames}
                    onChange={(e) => setFormData({ ...formData, commonNames: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phylum ID</label>
                  <input
                    type="number"
                    value={formData.phylum_id}
                    onChange={(e) => setFormData({ ...formData, phylum_id: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentStep === "taxonomy" && (
              <div className={styles.formStep}>
                <h3>Taxonomy Information</h3>
                <div className={styles.formGroup}>
                  <label>Kingdom</label>
                  <input
                    type="text"
                    placeholder="e.g., Plantae"
                    value={formData.kingdom}
                    onChange={(e) => setFormData({ ...formData, kingdom: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Order</label>
                  <input
                    type="text"
                    placeholder="e.g., Fabales"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Family</label>
                  <input
                    type="text"
                    placeholder="e.g., Fabaceae"
                    value={formData.family}
                    onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Subfamily</label>
                  <input
                    type="text"
                    placeholder="e.g., Caesalpinioideae"
                    value={formData.subfamily}
                    onChange={(e) => setFormData({ ...formData, subfamily: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Species</label>
                  <input
                    type="text"
                    placeholder="e.g., L. leucocephala"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentStep === "details" && (
              <div className={styles.formStep}>
                <h3>Plant Details</h3>
                <div className={styles.formGroup}>
                  <label>Morphology</label>
                  <textarea
                    placeholder="Describe the physical characteristics..."
                    value={formData.morphology}
                    onChange={(e) => setFormData({ ...formData, morphology: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ecology</label>
                  <textarea
                    placeholder="Describe the ecological characteristics..."
                    value={formData.ecology}
                    onChange={(e) => setFormData({ ...formData, ecology: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Distribution</label>
                  <textarea
                    placeholder="Geographic distribution..."
                    value={formData.distribution}
                    onChange={(e) => setFormData({ ...formData, distribution: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Uses</label>
                  <textarea
                    placeholder="Common uses and applications..."
                    value={formData.uses}
                    onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentStep === "media" && (
              <div className={styles.formStep}>
                <h3>Media & Images</h3>
                <div className={styles.formGroup}>
                  <label>Upload Plant Image</label>
                  <div className={styles.fileInputWrapper}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploading}
                      id="imageInput"
                    />
                    <label htmlFor="imageInput" className={styles.fileInputLabel}>
                      📁 Choose Image or Drag & Drop
                    </label>
                  </div>
                </div>
                {formData.imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={formData.imagePreview} alt="Plant preview" />
                    <p className={styles.imageFileName}>
                      {formData.imageFile?.name || "Image selected"}
                    </p>
                  </div>
                )}
                <p className={styles.helpText}>
                  📷 JPG, PNG up to 5MB. {formData.imageFile ? "Ready to upload" : "No image selected"}
                </p>
              </div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.prevBtn}
                onClick={goToPreviousStep}
                disabled={currentStep === "basic"}
              >
                Previous
              </button>
              {currentStep !== "media" ? (
                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={goToNextStep}
                >
                  Next
                </button>
              ) : (
                <button type="submit" className={styles.submitBtn}>
                  Create Plant
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {showForm && editingId && (
        <div className={styles.editViewContainer}>
          <div className={styles.editCard}>
            {/* LEFT IMAGE */}
            <div className={styles.editImageSection}>
              <img src={formData.imagePreview || PLACEHOLDER_IMAGE} alt={formData.name} className={styles.editImage} />
              <div className={styles.changeImageWrapper}>
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
            </div>

            {/* RIGHT CONTENT */}
            <div className={styles.editContent}>
              <div>
                <h1 className={styles.editTitle}>{formData.name}</h1>
                <div className={styles.editScientific}>
                  <em>{formData.scientificName || "Scientific name..."}</em>
                </div>
              </div>

              {/* TABS */}
              <div className={styles.editTabs}>
                <button 
                  onClick={() => setEditTab("taxonomy")}
                  className={`${styles.editTab} ${editTab === "taxonomy" ? styles.editTabActive : ""}`}
                >
                  Taxonomy
                </button>
                <button 
                  onClick={() => setEditTab("morphology")}
                  className={`${styles.editTab} ${editTab === "morphology" ? styles.editTabActive : ""}`}
                >
                  Morphology
                </button>
                <button 
                  onClick={() => setEditTab("ecology")}
                  className={`${styles.editTab} ${editTab === "ecology" ? styles.editTabActive : ""}`}
                >
                  Ecology
                </button>
                <button 
                  onClick={() => setEditTab("distribution")}
                  className={`${styles.editTab} ${editTab === "distribution" ? styles.editTabActive : ""}`}
                >
                  Distribution
                </button>
                <button 
                  onClick={() => setEditTab("uses")}
                  className={`${styles.editTab} ${editTab === "uses" ? styles.editTabActive : ""}`}
                >
                  Uses
                </button>
              </div>

              {/* TAB CONTENT */}
              <form onSubmit={handleSubmit}>
                {/* Basic Info Fields (always visible at top) */}
                <div className={styles.editBasicFields}>
                  <div className={styles.editFieldGroup}>
                    <label>Plant Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.editFieldGroup}>
                    <label>Scientific Name</label>
                    <input
                      type="text"
                      value={formData.scientificName}
                      onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                    />
                  </div>
                  <div className={styles.editFieldGroup}>
                    <label>Common Names</label>
                    <input
                      type="text"
                      value={formData.commonNames}
                      onChange={(e) => setFormData({ ...formData, commonNames: e.target.value })}
                    />
                  </div>
                </div>

                {/* TAXONOMY TAB */}
                {editTab === "taxonomy" && (
                  <div className={styles.editTabContent}>
                    <div className={styles.editFieldsGrid}>
                      <div className={styles.editFieldGroup}>
                        <label>Kingdom</label>
                        <input type="text" value={formData.kingdom} onChange={(e) => setFormData({ ...formData, kingdom: e.target.value })} />
                      </div>
                      <div className={styles.editFieldGroup}>
                        <label>Order</label>
                        <input type="text" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} />
                      </div>
                      <div className={styles.editFieldGroup}>
                        <label>Family</label>
                        <input type="text" value={formData.family} onChange={(e) => setFormData({ ...formData, family: e.target.value })} />
                      </div>
                      <div className={styles.editFieldGroup}>
                        <label>Subfamily</label>
                        <input type="text" value={formData.subfamily} onChange={(e) => setFormData({ ...formData, subfamily: e.target.value })} />
                      </div>
                      <div className={styles.editFieldGroup}>
                        <label>Species</label>
                        <input type="text" value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* MORPHOLOGY TAB */}
                {editTab === "morphology" && (
                  <div className={styles.editTabContent}>
                    <div className={styles.editFieldGroup}>
                      <label>Morphology Description</label>
                      <textarea
                        value={formData.morphology}
                        onChange={(e) => setFormData({ ...formData, morphology: e.target.value })}
                        placeholder="Describe the physical characteristics..."
                        rows={8}
                      />
                    </div>
                  </div>
                )}

                {/* ECOLOGY TAB */}
                {editTab === "ecology" && (
                  <div className={styles.editTabContent}>
                    <div className={styles.editFieldGroup}>
                      <label>Ecology Description</label>
                      <textarea
                        value={formData.ecology}
                        onChange={(e) => setFormData({ ...formData, ecology: e.target.value })}
                        placeholder="Describe the ecological characteristics..."
                        rows={8}
                      />
                    </div>
                  </div>
                )}

                {/* DISTRIBUTION TAB */}
                {editTab === "distribution" && (
                  <div className={styles.editTabContent}>
                    <div className={styles.editFieldGroup}>
                      <label>Geographic Distribution</label>
                      <textarea
                        value={formData.distribution}
                        onChange={(e) => setFormData({ ...formData, distribution: e.target.value })}
                        placeholder="Geographic distribution..."
                        rows={8}
                      />
                    </div>
                  </div>
                )}

                {/* USES TAB */}
                {editTab === "uses" && (
                  <div className={styles.editTabContent}>
                    <div className={styles.editFieldGroup}>
                      <label>Uses & Applications</label>
                      <textarea
                        value={formData.uses}
                        onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                        placeholder="Common uses and applications..."
                        rows={8}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.editFormActions}>
                  <button type="button" onClick={resetForm} className={styles.editCancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.editSaveBtn} disabled={uploading}>
                    {uploading ? "Uploading..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className={styles.plantsGrid}>
        {plants.length === 0 ? (
          <p className={styles.noPlants}>No plants found</p>
        ) : (
          plants.map((plant) => (
            <div key={plant.id} className={styles.plantCard}>
              <div className={styles.plantImage}>
                <img src={PLACEHOLDER_IMAGE} alt={plant.name} />
              </div>
              <div className={styles.plantDetails}>
                <h3 className={styles.plantName}>{plant.name}</h3>
                <p className={styles.plantDesc}>{plant.description}</p>
              </div>
              <div className={styles.plantActions}>
                <button
                  onClick={() => handleEdit(plant)}
                  className={styles.editBtn}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plant.id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
