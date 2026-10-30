import { useCallback, useEffect, useState } from "react";
import { getPlants, createPlant, updatePlant, deletePlant } from "../../../services/plantAdmin";
import type { PlantRecord } from "../../../services/plantAdmin";
import { errorMessage } from "../../../services/errors";
import { generatePlantQRCode } from "../../../services/qrCodeService";
import { useFetchTaxonomy } from "../../../back-end/hooks/useFetchTaxonomy";
import QRModal from "../QRModal";
import ConfirmationModal from "../ConfirmationModal";
import PlantCreateForm from "./PlantCreateForm";
import PlantEditForm from "./PlantEditForm";
import PlantList from "./PlantList";
import { usePlantQRModal } from "./usePlantQRModal";
import {
  EMPTY_FORM,
  formFromPlant,
  payloadFromForm,
  validateImage,
  type GenusOption,
  type PlantFormData,
} from "./plantForm";
import styles from "./ManagePlants.module.css";

export default function ManagePlants() {
  const [plants, setPlants] = useState<PlantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlantFormData>(EMPTY_FORM);
  const [genusOptions, setGenusOptions] = useState<GenusOption[]>([]);
  const [qrCodePreview, setQrCodePreview] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<PlantRecord | null>(null);
  const [isEditConfirming, setIsEditConfirming] = useState(false);

  const { fetch: fetchTaxonomy } = useFetchTaxonomy();

  const flash = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const qr = usePlantQRModal({ onError: setError, onSuccess: flash });

  // Genus drop-down options
  useEffect(() => {
    let isMounted = true;

    const loadGenusOptions = async () => {
      try {
        const taxonomy = await fetchTaxonomy();
        if (!isMounted) return;
        setGenusOptions((taxonomy.genus ?? []).map((g) => ({ value: g.id, label: g.name || g.id })));
      } catch (err) {
        if (!isMounted) return;
        setGenusOptions([]);
        setError(`Could not load the genus list: ${errorMessage(err)}`);
      }
    };

    loadGenusOptions();

    return () => {
      isMounted = false;
    };
    // fetchTaxonomy is recreated on every render; this must run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setPlants(await getPlants());
    } catch (err) {
      setError(errorMessage(err, "Failed to fetch plants"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError("");
    setSuccess("");
    setQrCodePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const problem = validateImage(file);
    if (problem) {
      setError(problem);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, imageFile: file, imagePreview: ev.target?.result as string }));
      setError("");
    };
    reader.onerror = () => setError("Failed to read image file");
    reader.readAsDataURL(file);
  };

  const handleEdit = (plant: PlantRecord) => {
    setFormData(formFromPlant(plant));
    setEditingId(plant.id);
    setShowForm(true);
    setError("");

    generatePlantQRCode({ plantId: plant.id, width: 250 })
      .then(setQrCodePreview)
      .catch(() => setQrCodePreview(""));
  };

  const performSubmit = async () => {
    try {
      setSaving(true);
      const payload = payloadFromForm(formData);
      const image = formData.imageFile || undefined;

      if (editingId) {
        await updatePlant(editingId, payload, image);
        setSuccess("Plant updated successfully!");
      } else {
        await createPlant(payload, image);
        setSuccess("Plant created successfully!");
      }

      setTimeout(() => {
        resetForm();
        fetchPlants();
      }, 1000);
    } catch (err) {
      setError(errorMessage(err, "Failed to save plant"));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!editingId && !formData.imageFile) {
      setError("Please upload a plant image before creating");
      return;
    }

    setError("");
    setSuccess("");

    // Editing asks for confirmation first; creating saves straight away
    if (editingId) {
      setIsEditConfirming(true);
      return;
    }
    await performSubmit();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setError("");
      setSaving(true);
      await deletePlant(deleteTarget.id);
      setSuccess("Plant deleted successfully!");
      setDeleteTarget(null);
      fetchPlants();
    } catch (err) {
      setError(errorMessage(err, "Failed to delete plant"));
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading plants...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Plants</h2>
        <button className={styles.addBtn} onClick={() => (showForm ? resetForm() : setShowForm(true))}>
          {showForm ? "Cancel" : "+ Add Plant"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {showForm && !editingId && (
        <PlantCreateForm
          formData={formData}
          setFormData={setFormData}
          genusOptions={genusOptions}
          uploading={saving}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          onError={setError}
        />
      )}

      {showForm && editingId && (
        <PlantEditForm
          key={editingId}
          plantId={editingId}
          formData={formData}
          setFormData={setFormData}
          genusOptions={genusOptions}
          qrCodePreview={qrCodePreview}
          uploading={saving}
          qrLoading={qr.isLoading}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          onOpenQR={() =>
            qr.open({
              id: editingId,
              commonName: formData.commonName,
              scientificName: formData.scientificName,
            })
          }
        />
      )}

      <PlantList
        plants={plants}
        qrLoading={qr.isLoading}
        onEdit={handleEdit}
        onOpenQR={(plant) =>
          qr.open({
            id: plant.id,
            commonName: plant.commonName || "",
            scientificName: plant.scientificName || "",
          })
        }
        onDelete={setDeleteTarget}
      />

      <QRModal
        isOpen={qr.isOpen}
        onClose={qr.close}
        plantName={qr.plant?.commonName || ""}
        scientificName={qr.plant?.scientificName || ""}
        qrCodeDataUrl={qr.dataUrl}
        onDownload={qr.download}
        onPrint={qr.print}
        isLoading={qr.isLoading}
      />

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Plant"
        message={`Are you sure you want to permanently delete "${deleteTarget?.commonName || "this plant"}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={saving}
        isDangerous={true}
      />

      <ConfirmationModal
        isOpen={isEditConfirming}
        onClose={() => setIsEditConfirming(false)}
        onConfirm={() => {
          setIsEditConfirming(false);
          performSubmit();
        }}
        title="Save Changes"
        message={`Are you sure you want to save all changes to "${formData.commonName}"?`}
        confirmText="Save Changes"
        cancelText="Cancel"
        isLoading={saving}
        isDangerous={false}
      />
    </div>
  );
}
