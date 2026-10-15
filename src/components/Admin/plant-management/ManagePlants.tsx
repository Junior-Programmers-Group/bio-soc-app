import { useEffect, useState } from "react";
import {
  getPlants,
  createPlant,
  updatePlant,
  deletePlant,
} from "../../../services/plantAdmin";
import type { PlantRecord } from "../../../services/plantAdmin";
import { errorMessage } from "../../../services/errors";
import { downloadPlantQRCode, generatePlantQRCode, printPlantQRCode } from "../../../services/qrCodeService";
import { getSpeciesImageUrl } from "../../../services/imageUrl";
import { SITE_URL } from "../../../config";
import { useFetchTaxonomy } from "../../../back-end/hooks/useFetchTaxonomy";
import QRModal from "../QRModal";
import ConfirmationModal from "../ConfirmationModal";
import styles from "./ManagePlants.module.css";

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/300x250/2d5016/ffffff?text=Plant";

// Image URL for a plant, or a placeholder when it has none
const buildImageUrl = (plant: PlantRecord): string => {
  if (!plant.id) return PLACEHOLDER_IMAGE;

  return getSpeciesImageUrl(plant) || PLACEHOLDER_IMAGE;
};

type FormStep = "basic" | "details" | "media";
type EditTab = "basic" | "morphology" | "ecology" | "distribution" | "uses";
type FieldType = "text" | "textarea" | "number" | "select";

interface PlantFormData {
  commonName: string;
  scientificName: string;
  genus: string;
  genusId: string;  // For relationship fetching
  author: string;
  year: string;
  conservationStatus: string;
  notes: string;
  imageFile: File | null;
  imagePreview: string;
  morphology: string;
  ecology: string;
  distribution: string;
  uses: string;
}

// REUSABLE FORM FIELDS - with support for select fields
interface FormFieldConfig {
  key: keyof PlantFormData;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
}

const FormFields = ({
  fields,
  formData,
  setFormData,
  onGenusChange,
}: {
  fields: FormFieldConfig[];
  formData: PlantFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlantFormData>>;
  onGenusChange?: (genusId: string) => void;
}) => (
  <>
    {fields.map((f) => (
      <div key={f.key} className={styles.formGroup}>
        <label>
          {f.label}
          {f.required && <span style={{color: '#dc2626'}}> *</span>}
        </label>
        {f.type === "textarea" ? (
          <textarea
            value={(formData[f.key] as string) || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
            }
            required={f.required}
            placeholder={f.required ? `${f.label} (required)` : f.label}
          />
        ) : f.type === "select" ? (
          <select
            value={(formData[f.key] as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, [f.key]: value }));
              // Special handling for genus field
              if (f.key === "genus" && onGenusChange) {
                onGenusChange(value);
              }
            }}
            required={f.required}
          >
            <option value="">
              {f.key === "genus" && (!f.options || f.options.length === 0)
                ? "Loading genus options..."
                : `Select ${f.label}`}
            </option>
            {f.options && f.options.length > 0
              ? f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : null}
          </select>
        ) : (
          <input
            type={f.type}
            value={(formData[f.key] as string) || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
            }
            required={f.required}
            placeholder={f.required ? `${f.label} (required)` : f.label}
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
  const [editTab, setEditTab] = useState<EditTab>("basic");
  const [uploading, setUploading] = useState(false);
  const [qrCodePreview, setQrCodePreview] = useState<string>("");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRPlant, setSelectedQRPlant] = useState<{ id: string; commonName: string; scientificName: string } | null>(null);
  const [modalQRDataUrl, setModalQRDataUrl] = useState<string>("");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [genusOptions, setGenusOptions] = useState<{ value: string; label: string }[]>([]);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [deleteConfirmingId, setDeleteConfirmingId] = useState<string | null>(null);
  const [isEditConfirming, setIsEditConfirming] = useState(false);
  const [deletePlantName, setDeletePlantName] = useState<string>("");

  const { fetch: fetchTaxonomy } = useFetchTaxonomy();

  const [formData, setFormData] = useState<PlantFormData>({
    commonName: "",
    scientificName: "",
    genus: "",
    genusId: "",
    author: "",
    year: "",
    conservationStatus: "",
    notes: "",
    imageFile: null,
    imagePreview: "",
    morphology: "",
    ecology: "",
    distribution: "",
    uses: "",
  });

  // Load genus options
  useEffect(() => {
    let isMounted = true;

    const loadGenusOptions = async () => {
      try {
        console.log("📥 Loading genus options...");
        const taxonomy = await fetchTaxonomy();
        
        if (!isMounted) return; // Component unmounted, don't update state
        
        console.log("📋 Taxonomy data received:", {
          hasDomain: !!taxonomy?.domain,
          hasKingdom: !!taxonomy?.kingdom,
          hasPhylum: !!taxonomy?.phylum,
          hasClass: !!taxonomy?.class,
          hasOrder: !!taxonomy?.order,
          hasFamily: !!taxonomy?.family,
          hasGenus: !!taxonomy?.genus,
          genusCount: taxonomy?.genus?.length || 0,
        });

        if (taxonomy?.genus && Array.isArray(taxonomy.genus)) {
          const options = taxonomy.genus.map((g: any) => ({
            value: g.id,
            label: g.name || g.common_name || g.id,
          }));
          console.log("✓ Genus options loaded successfully:", options.length, "options");
          if (options.length <= 5) {
            console.log("  Genus options:", options.map(o => `${o.label} (${o.value})`).join(", "));
          }
          setGenusOptions(options);
        } else {
          console.warn("⚠️  Invalid or missing genus data in taxonomy:", {
            genusExists: !!taxonomy?.genus,
            isArray: Array.isArray(taxonomy?.genus),
            type: typeof taxonomy?.genus,
          });
          setGenusOptions([]);
        }
      } catch (err: any) {
        if (isMounted && !err.message?.includes('aborted')) {
          console.error("❌ Error loading genus options:", err?.message || err);
        }
        setGenusOptions([]);
      }
    };

    loadGenusOptions();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  // Create STEP_FIELDS dynamically with genus options
  const STEP_FIELDS: Record<FormStep, FormFieldConfig[]> = {
    basic: [
      { key: "commonName", label: "Common Name", type: "text", required: true },
      { key: "scientificName", label: "Scientific Name", type: "text", required: true },
      { key: "author", label: "Author", type: "text", required: true },
      { key: "year", label: "Year", type: "number", required: true },
      { key: "genus", label: "Genus", type: "select", required: true, options: genusOptions },
      { key: "conservationStatus", label: "Conservation Status", type: "text", required: true },
      { key: "notes", label: "Notes", type: "textarea", required: true },
    ],
    details: [
      { key: "morphology", label: "Morphology", type: "textarea", required: true },
      { key: "ecology", label: "Ecology", type: "textarea", required: true },
      { key: "distribution", label: "Distribution", type: "textarea", required: true },
      { key: "uses", label: "Uses", type: "textarea", required: true },
    ],
    media: [],
  };

  // Edit tabs configuration
  const EDIT_TABS: Record<EditTab, FormFieldConfig[]> = {
    basic: [
      { key: "commonName", label: "Common Name *", type: "text" },
      { key: "scientificName", label: "Scientific Name", type: "text" },
      { key: "author", label: "Author", type: "text" },
      { key: "year", label: "Year", type: "number" },
      { key: "genus", label: "Genus", type: "select", options: genusOptions },
      { key: "conservationStatus", label: "Conservation Status", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    morphology: [{ key: "morphology", label: "Morphology", type: "textarea" }],
    ecology: [{ key: "ecology", label: "Ecology", type: "textarea" }],
    distribution: [{ key: "distribution", label: "Distribution", type: "textarea" }],
    uses: [{ key: "uses", label: "Uses", type: "textarea" }],
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchPlants = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPlants();
        if (!controller.signal.aborted) {
          setPlants(data);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          if (err?.message?.includes("cancelled") || err?.isAbort) {
            return;
          }
          console.error("Error fetching plants:", err);
          setError(errorMessage(err, "Failed to fetch plants"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPlants();

    return () => {
      controller.abort();
    };
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
      setError(errorMessage(err, "Failed to fetch plants"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQRModal = async (plant: PlantRecord) => {
    try {
      setIsModalLoading(true);
      setError("");
      const qrDataUrl = await generatePlantQRCode({
        plantId: plant.id,
        width: 400,
      });
      setSelectedQRPlant({
        id: plant.id,
        commonName: plant.commonName || "",
        scientificName: plant.scientificName || "",
      });
      setModalQRDataUrl(qrDataUrl);
      setIsQRModalOpen(true);
    } catch (err: any) {
      console.error("Error generating QR code for modal:", err);
      setError(err.message || "Failed to generate QR code");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseQRModal = () => {
    setIsQRModalOpen(false);
    setSelectedQRPlant(null);
    setModalQRDataUrl("");
  };

  const handleModalDownloadQR = async () => {
    if (!selectedQRPlant) return;
    try {
      setIsModalLoading(true);
      await downloadPlantQRCode(selectedQRPlant.id, selectedQRPlant.commonName);
      setSuccess("QR Code downloaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
      handleCloseQRModal();
    } catch (err: any) {
      console.error("Error downloading QR code:", err);
      setError(err.message || "Failed to download QR code");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleModalPrintQR = async () => {
    if (!selectedQRPlant) return;
    try {
      setIsModalLoading(true);
      await printPlantQRCode(
        selectedQRPlant.id,
        selectedQRPlant.commonName,
        selectedQRPlant.scientificName
      );
      setSuccess("Print dialog opened!");
      setTimeout(() => setSuccess(""), 3000);
      handleCloseQRModal();
    } catch (err: any) {
      console.error("Error printing QR code:", err);
      setError(err.message || "Failed to print QR code");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("❌ Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("❌ Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const previewData = ev.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: previewData,
      }));
      setError("");
      console.log("✓ Image selected and preview loaded:", file.name);
    };
    reader.onerror = () => {
      setError("❌ Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleGenusChange = (genusId: string) => {
    setFormData((prev) => ({ ...prev, genus: genusId, genusId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous submissions
    if (uploading) return;
    
    // Validate that image is uploaded for new plant creation
    if (!editingId && !formData.imageFile) {
      setError("❌ Please upload a plant image before creating");
      return;
    }
    
    setError("");
    setSuccess("");

    // If editing, show confirmation modal instead of submitting directly
    if (editingId) {
      setIsEditConfirming(true);
      return;
    }

    // For new plants, proceed with submission
    await performSubmit(formData);
  };

  const performSubmit = async (data: PlantFormData) => {
    try {
      setUploading(true);
      // Debug: log the form data before submission
      console.log("📤 Submitting plant form:", {
        editingId,
        commonName: data.commonName,
        scientificName: data.scientificName,
        genus: data.genus,
        genusId: data.genusId,
        hasImage: !!data.imageFile,
      });

      console.log("📝 Details being saved:", {
        morphology: data.morphology,
        ecology: data.ecology,
        distribution: data.distribution,
        uses: data.uses,
      });

      // Remove imageFile, imagePreview, and genusId from payload
      const { imageFile, imagePreview, genusId, ...dataWithoutFile } = data;
      const payload = {
        ...dataWithoutFile,
        year: data.year ? Number(data.year) : undefined,
      };

      console.log("📦 Payload to save:", {
        ...payload,
        imageIncluded: !!imageFile,
      });

      if (editingId) {
        // Update existing plant
        console.log("🔄 Updating plant:", editingId);
        await updatePlant(editingId, payload, imageFile || undefined);
        setSuccess("✓ Plant updated successfully!");
      } else {
        // Create new plant
        console.log("✨ Creating new plant");
        await createPlant(payload, imageFile || undefined);
        setSuccess("✓ Plant created successfully!");
      }

      setTimeout(() => {
        resetForm();
        fetchPlants();
      }, 1000);
    } catch (err: any) {
      if (!err?.message?.includes("cancelled")) {
        console.error("❌ Error saving plant:", err);
        setError(errorMessage(err, "Failed to save plant"));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmEdit = () => {
    setIsEditConfirming(false);
    performSubmit(formData);
  };

  const handleDelete = async (id: string) => {
    // Find the plant to get its name for confirmation message
    const plant = plants.find(p => p.id === id);
    setDeleteConfirmingId(id);
    setDeletePlantName(plant?.commonName || "this plant");
    setIsDeleteConfirming(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmingId) return;
    
    try {
      setError("");
      setUploading(true);
      await deletePlant(deleteConfirmingId);
      setSuccess("✓ Plant deleted successfully!");
      setIsDeleteConfirming(false);
      setDeleteConfirmingId(null);
      setDeletePlantName("");
      setTimeout(() => {
        fetchPlants();
      }, 500);
    } catch (err: any) {
      if (!err?.message?.includes("cancelled")) {
        setError(errorMessage(err, "Failed to delete plant"));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (plant: PlantRecord) => {
    // Build image preview URL from species collection
    const imageUrl = buildImageUrl(plant);
    console.log("✓ Loading plant for edit:", { plantId: plant.id, imageUrl });

    // Debug: log all plant data to see what we have
    console.log("📋 Plant data loaded:", {
      commonName: plant.commonName,
      scientificName: plant.scientificName,
      genus: plant.genus,
      morphology: plant.morphology,
      ecology: plant.ecology,
      distribution: plant.distribution,
      uses: plant.uses,
    });

    // Find the genus ID by matching the stored genus value with available options
    // Handle both cases: genus stored as ID or as name
    let genusId = plant.genus || "";
    
    if (genusId && genusOptions.length > 0) {
      // First, try direct ID match
      const matchByValue = genusOptions.find(opt => opt.value === genusId);
      if (matchByValue) {
        genusId = matchByValue.value;
        console.log("✓ Genus matched by ID:", genusId);
      } else {
        // Try matching by label (in case genus is stored as name)
        const matchByLabel = genusOptions.find(opt => opt.label === genusId);
        if (matchByLabel) {
          genusId = matchByLabel.value;
          console.log("✓ Genus matched by label:", genusId);
        } else {
          // No match found - keep the original value, user can still change it via dropdown
          console.warn("⚠️  Genus not found in options:", plant.genus);
        }
      }
    } else if (genusId && genusOptions.length === 0) {
      // Genus options haven't loaded yet - keep the value and it will match once options load
      console.warn("⚠️  Genus options not yet loaded, keeping original value:", genusId);
    }

    setFormData({
      commonName: plant.commonName || "",
      scientificName: plant.scientificName || "",
      genus: genusId,
      genusId: genusId,  // For relationship fetching
      author: plant.author || "",
      year: plant.year?.toString() || "",
      conservationStatus: plant.conservationStatus || "",
      notes: plant.notes || "",
      imageFile: null,
      imagePreview: imageUrl,
      morphology: plant.morphology || "",
      ecology: plant.ecology || "",
      distribution: plant.distribution || "",
      uses: plant.uses || "",
    });
    setEditingId(plant.id);
    setShowForm(true);
    setCurrentStep("basic");
    setEditTab("basic");
    
    // Generate QR code preview
    generatePlantQRCode({
      plantId: plant.id,
      width: 250,
    })
      .then((qrUrl) => {
        setQrCodePreview(qrUrl);
      })
      .catch((err) => {
        console.error("Error generating QR preview:", err);
        setQrCodePreview("");
      });
  };

  const resetForm = () => {
    setFormData({
      commonName: "",
      scientificName: "",
      genus: "",
      genusId: "",
      author: "",
      year: "",
      conservationStatus: "",
      notes: "",
      imageFile: null,
      imagePreview: "",
      morphology: "",
      ecology: "",
      distribution: "",
      uses: "",
    });
    setEditingId(null);
    setShowForm(false);
    setCurrentStep("basic");
    setEditTab("basic");
    setError("");
    setSuccess("");
    setQrCodePreview("");
  };

  // Validate if all required fields in current step are filled
  const validateCurrentStep = (): boolean => {
    const fields = STEP_FIELDS[currentStep];
    
    for (const field of fields) {
      if (field.required) {
        const value = (formData[field.key] as string)?.trim() || "";
        if (!value) {
          setError(`❌ ${field.label} is required`);
          console.warn(`Validation failed: ${field.label} is empty`);
          return false;
        }
      }
    }
    setError("");
    return true;
  };

  const goToStep = (step: FormStep) => setCurrentStep(step);
  const goToNextStep = () => {
    if (!validateCurrentStep()) {
      return; // Don't proceed if validation fails
    }
    
    const steps: FormStep[] = ["basic", "details", "media"];
    const idx = steps.indexOf(currentStep);
    if (idx < steps.length - 1) {
      setCurrentStep(steps[idx + 1]);
      setError("");
    }
  };
  const goToPreviousStep = () => {
    const steps: FormStep[] = ["basic", "details", "media"];
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
            {(["basic", "details", "media"] as FormStep[]).map(
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
                onGenusChange={handleGenusChange}
              />
            ) : (
              <div>
                <div className={styles.formGroup}>
                  <label>Plant Image<span style={{color: '#dc2626'}}> *</span> (Required)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    required
                  />
                  <small style={{ color: "#666", marginTop: "0.5rem", display: "block", fontSize: "0.85rem" }}>
                    Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                  </small>
                  {formData.imagePreview && (
                    <div style={{ marginTop: "1rem" }}>
                      <p style={{color: "#14532d", fontWeight: "600", marginBottom: "0.5rem"}}>✓ Image uploaded</p>
                      <img
                        src={formData.imagePreview}
                        alt="preview"
                        className={styles.imagePreview}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <button 
                type="button" 
                onClick={goToPreviousStep} 
                disabled={currentStep === "basic"}
                className={styles.prevBtn}
              >
                ‹ Back
              </button>
              {currentStep !== "media" ? (
                <button 
                  type="button" 
                  onClick={goToNextStep}
                  className={styles.nextBtn}
                >
                  Next ›
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={uploading || !formData.imageFile}
                  className={styles.submitBtn}
                >
                  {uploading ? "Uploading..." : "Create Plant"}
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
                alt={formData.commonName || "Plant"}
                className={styles.editImage}
                onError={(e) => {
                  console.warn("Image failed to load:", formData.imagePreview);
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
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
                 Change Image
              </label>
              {formData.imageFile && (
                <p style={{ fontSize: "12px", color: "#14532d", marginTop: "0.5rem" }}>✓ New image selected</p>
              )}
            </div>

            <div className={styles.editContent}>
              <h1>{formData.commonName}</h1>
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
                  onGenusChange={handleGenusChange}
                />
                
                {/* QR Code Preview and Download */}
                {qrCodePreview && (
                  <div className={styles.qrCodeSection}>
                    <h3>QR Code</h3>
                    <img 
                      src={qrCodePreview} 
                      alt="Plant QR Code" 
                      className={styles.qrCodePreview}
                    />
                    <p style={{ fontSize: "12px", color: "#666" }}>
                      Works with: Android Camera, iOS Camera & All QR Scanners
                    </p>
                    <p style={{ fontSize: "11px", color: "#999", wordBreak: "break-all" }}>
                      <strong>URL:</strong> {SITE_URL}/discover/plants/{editingId}
                    </p>
                  </div>
                )}
                
                <div className={styles.editFormActions}>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => editingId && handleOpenQRModal({ id: editingId, commonName: formData.commonName, scientificName: formData.scientificName } as PlantRecord)}
                    disabled={isModalLoading || !editingId}
                    className={styles.downloadQRBtn}
                  >
                    {isModalLoading ? "Loading..." : "QR Code"}
                  </button>
                  <button 
                    type="submit" 
                    disabled={uploading}
                    className={styles.saveBtn}
                  >
                    {uploading ? "Uploading..." : " Save Changes"}
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
        {plants.map((plant) => {
          const imageUrl = buildImageUrl(plant);

          return (
          <div key={plant.id} className={styles.plantCard}>
            <img
              src={imageUrl}
              alt={plant.commonName}
            />
            <div style={{ marginBottom: "10px", paddingTop: "15px", paddingLeft: "15px", paddingRight: "12px" }}>
              <h3 style={{ margin: "0 0 4px 0", lineHeight: "1.2" }}>{plant.commonName}</h3>
              <em style={{ fontSize: "12px", color: "#999", display: "block", fontStyle: "italic" }}>{plant.scientificName || ""}</em>
            </div>
            <div className={styles.cardActions}>
              <button onClick={() => handleEdit(plant)}>Edit</button>
              <button 
                onClick={() => handleOpenQRModal(plant)}
                disabled={isModalLoading}
                className={styles.qrBtn}
              >
                QR Code
              </button>
              <button 
                onClick={() => handleDelete(plant.id)}
                className={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          </div>
        );
        })}
      </div>

      {/* QR CODE MODAL */}
      <QRModal
        isOpen={isQRModalOpen}
        onClose={handleCloseQRModal}
        plantName={selectedQRPlant?.commonName || ""}
        scientificName={selectedQRPlant?.scientificName || ""}
        qrCodeDataUrl={modalQRDataUrl}
        onDownload={handleModalDownloadQR}
        onPrint={handleModalPrintQR}
        isLoading={isModalLoading}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={isDeleteConfirming}
        onClose={() => {
          setIsDeleteConfirming(false);
          setDeleteConfirmingId(null);
          setDeletePlantName("");
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Plant"
        message={`Are you sure you want to permanently delete "${deletePlantName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={uploading}
        isDangerous={true}
      />

      {/* EDIT CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={isEditConfirming}
        onClose={() => setIsEditConfirming(false)}
        onConfirm={handleConfirmEdit}
        title="Save Changes"
        message={`Are you sure you want to save all changes to "${formData.commonName}"?`}
        confirmText="Save Changes"
        cancelText="Cancel"
        isLoading={uploading}
        isDangerous={false}
      />
    </div>
  );
}
