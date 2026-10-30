import { useState } from "react";
import FormFields from "./FormFields";
import { SITE_URL } from "../../../config";
import {
  PLACEHOLDER_IMAGE,
  editTabFields,
  type EditTab,
  type GenusOption,
  type PlantFormData,
} from "./plantForm";
import styles from "./ManagePlants.module.css";

interface Props {
  plantId: string;
  formData: PlantFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlantFormData>>;
  genusOptions: GenusOption[];
  qrCodePreview: string;
  uploading: boolean;
  qrLoading: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onOpenQR: () => void;
}

/** Tabbed "edit plant" form with the plant's image and QR code. */
export default function PlantEditForm({
  plantId,
  formData,
  setFormData,
  genusOptions,
  qrCodePreview,
  uploading,
  qrLoading,
  onImageChange,
  onSubmit,
  onCancel,
  onOpenQR,
}: Props) {
  const [tab, setTab] = useState<EditTab>("basic");
  const tabs = editTabFields(genusOptions);

  return (
    <div className={styles.editViewContainer}>
      <div className={styles.editCard}>
        <div className={styles.editImageSection}>
          <img
            src={formData.imagePreview || PLACEHOLDER_IMAGE}
            alt={formData.commonName || "Plant"}
            className={styles.editImage}
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
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
            {(Object.keys(tabs) as EditTab[]).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={`${styles.editTab} ${tab === name ? styles.editTabActive : ""}`}
              >
                {name.toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit}>
            <FormFields fields={tabs[tab]} formData={formData} setFormData={setFormData} />

            {qrCodePreview && (
              <div className={styles.qrCodeSection}>
                <h3>QR Code</h3>
                <img src={qrCodePreview} alt="Plant QR Code" className={styles.qrCodePreview} />
                <p style={{ fontSize: "12px", color: "#666" }}>
                  Works with: Android Camera, iOS Camera & All QR Scanners
                </p>
                <p style={{ fontSize: "11px", color: "#999", wordBreak: "break-all" }}>
                  <strong>URL:</strong> {SITE_URL}/discover/plants/{plantId}
                </p>
              </div>
            )}

            <div className={styles.editFormActions}>
              <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="button" onClick={onOpenQR} disabled={qrLoading} className={styles.downloadQRBtn}>
                {qrLoading ? "Loading..." : "QR Code"}
              </button>
              <button type="submit" disabled={uploading} className={styles.saveBtn}>
                {uploading ? "Uploading..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
