import { useState } from "react";
import FormFields from "./FormFields";
import {
  FORM_STEPS,
  stepFields,
  type FormStep,
  type GenusOption,
  type PlantFormData,
} from "./plantForm";
import styles from "./ManagePlants.module.css";

interface Props {
  formData: PlantFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlantFormData>>;
  genusOptions: GenusOption[];
  uploading: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onError: (message: string) => void;
}

/** Three-step "add plant" form: basic info, descriptions, image. */
export default function PlantCreateForm({
  formData,
  setFormData,
  genusOptions,
  uploading,
  onImageChange,
  onSubmit,
  onError,
}: Props) {
  const [step, setStep] = useState<FormStep>("basic");
  const fields = stepFields(genusOptions);
  const index = FORM_STEPS.indexOf(step);

  const goNext = () => {
    for (const field of fields[step]) {
      if (field.required && !(formData[field.key] as string)?.trim()) {
        onError(`${field.label} is required`);
        return;
      }
    }
    onError("");
    if (index < FORM_STEPS.length - 1) setStep(FORM_STEPS[index + 1]);
  };

  const goBack = () => {
    if (index > 0) setStep(FORM_STEPS[index - 1]);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formSteps}>
        {FORM_STEPS.map((name, i) => (
          <button
            key={name}
            type="button"
            className={`${styles.stepBtn} ${step === name ? styles.activeStep : ""}`}
            onClick={() => setStep(name)}
          >
            <span className={styles.stepNumber}>{i + 1}</span>
            <span className={styles.stepLabel}>{name.toUpperCase()}</span>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className={styles.form}>
        {step !== "media" ? (
          <FormFields fields={fields[step]} formData={formData} setFormData={setFormData} />
        ) : (
          <div className={styles.formGroup}>
            <label htmlFor="plant-image">
              Plant Image<span style={{ color: "#dc2626" }}> *</span> (Required)
            </label>
            <input
              id="plant-image"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              disabled={uploading}
              required
            />
            <small style={{ color: "#666", marginTop: "0.5rem", display: "block", fontSize: "0.85rem" }}>
              Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
            </small>
            {formData.imagePreview && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ color: "#14532d", fontWeight: "600", marginBottom: "0.5rem" }}>
                  ✓ Image uploaded
                </p>
                <img src={formData.imagePreview} alt="Preview of the chosen plant" className={styles.imagePreview} />
              </div>
            )}
          </div>
        )}

        <div className={styles.formActions}>
          <button type="button" onClick={goBack} disabled={step === "basic"} className={styles.prevBtn}>
            ‹ Back
          </button>
          {step !== "media" ? (
            <button type="button" onClick={goNext} className={styles.nextBtn}>
              Next ›
            </button>
          ) : (
            <button type="submit" disabled={uploading || !formData.imageFile} className={styles.submitBtn}>
              {uploading ? "Uploading..." : "Create Plant"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
