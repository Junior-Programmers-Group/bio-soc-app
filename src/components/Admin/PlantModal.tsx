import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import modalStyles from "./modalStyles";
import { createPlant, updatePlant } from "../../services/plantAdmin";
import { errorMessage } from "../../services/errors";
import { splitCommonNames } from "../../lib/format";
import { STATUS_OPTIONS } from "../../lib/status";
import statusStyles from "../../lib/status.module.css";
import type { Plant } from "../../types/plant";
import {
  EMPTY_FORM,
  formFromPlant,
  nextSpecimenCode,
  payloadFromForm,
  toggledStatus,
  validateImage,
  validatePlantForm,
  type PlantFormData,
} from "./plantForm";
import styles from "./PlantModal.module.css";

export interface GenusOption {
  id: string;
  name: string;
}

interface Props {
  /** The plant being edited, or null for "New plant". */
  plant: Plant | null;
  plants: Plant[];
  genera: GenusOption[];
  onSaved: (name: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

const STATUS_CLASS = { LC: statusStyles.lc, VU: statusStyles.vu, EN: statusStyles.en } as const;

/** New plant / Edit plant. */
export default function PlantModal({ plant, plants, genera, onSaved, onError, onClose }: Props) {
  const isNew = plant === null;
  const [form, setForm] = useState<PlantFormData>(() => (plant ? formFromPlant(plant) : EMPTY_FORM));
  const [saving, setSaving] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrl = useRef("");

  // free the preview of a chosen file when the dialog closes
  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  const set = <K extends keyof PlantFormData>(key: K, value: PlantFormData[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const chooseFile = (file: File | undefined) => {
    if (!file) return;
    const problem = validateImage(file);
    if (problem) return onError(problem);
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setForm((current) => ({ ...current, imageFile: file, imagePreview: objectUrl.current }));
  };

  const save = async () => {
    const problem = validatePlantForm(form, isNew);
    if (problem) return onError(problem);

    setSaving(true);
    try {
      const image = form.imageFile ?? undefined;
      if (plant) {
        await updatePlant(plant.id, payloadFromForm(form), image);
      } else {
        await createPlant(payloadFromForm(form, nextSpecimenCode(plants)), image);
      }
      onSaved(splitCommonNames(form.commonName).name);
    } catch (err) {
      onError(errorMessage(err, "Failed to save plant"));
      setSaving(false);
    }
  };

  const selected = toggledStatus(form.conservationStatus);

  return (
    <Modal title={plant ? `Edit ${plant.commonName}` : "New plant"} width={760} titleSize="large" onClose={onClose}>
      <div className={styles.body}>
        <div className={styles.photoCol}>
          <span className={styles.label}>Photo</span>
          <button
            type="button"
            className={styles.dropzone}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              chooseFile(e.dataTransfer.files?.[0]);
            }}
            aria-label={form.imagePreview ? "Change photo" : "Add photo"}
          >
            {form.imagePreview ? (
              <img src={form.imagePreview} alt="" />
            ) : (
              <>
                <i className="bi bi-cloud-arrow-up"></i>
                <span className={styles.dropTitle}>Drop or browse</span>
                <span className={styles.dropNote}>JPG or PNG, 5 MB max</span>
              </>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png"
            className={styles.fileInput}
            onChange={(e) => {
              chooseFile(e.target.files?.[0]);
              e.target.value = "";
            }}
            tabIndex={-1}
          />
        </div>

        <div className={styles.fields}>
          <div className={styles.row2}>
            <label className={styles.field}>
              Common name
              <input
                className={styles.input}
                value={form.commonName}
                onChange={(e) => set("commonName", e.target.value)}
                placeholder="e.g. Narra"
              />
            </label>
            <label className={styles.field}>
              Scientific name
              <input
                className={`${styles.input} ${styles.italic}`}
                value={form.scientificName}
                onChange={(e) => set("scientificName", e.target.value)}
                placeholder="e.g. Pterocarpus indicus"
              />
            </label>
          </div>

          <div className={styles.row3}>
            <label className={styles.field}>
              Genus
              <span className={styles.selectWrap}>
                <select
                  className={`${styles.input} ${styles.select} ${form.genus ? styles.italic : ""}`}
                  value={form.genus}
                  onChange={(e) => set("genus", e.target.value)}
                >
                  <option value="">Choose a genus</option>
                  {genera.map((genus) => (
                    <option key={genus.id} value={genus.id}>
                      {genus.name}
                    </option>
                  ))}
                </select>
                <i className="bi bi-chevron-down"></i>
              </span>
            </label>
            <label className={styles.field}>
              Author
              <input className={styles.input} value={form.author} onChange={(e) => set("author", e.target.value)} />
            </label>
            <label className={styles.field}>
              Year
              <input
                className={styles.input}
                value={form.year}
                onChange={(e) => set("year", e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
              />
            </label>
          </div>
          <span className={styles.helper}>Family, order and class are filled in from the genus.</span>

          <div className={styles.field} role="group" aria-label="Conservation status">
            Conservation status
            <div className={styles.toggles}>
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`${styles.toggle} ${STATUS_CLASS[option.key]} ${selected === option.key ? styles.toggleOn : ""}`}
                  onClick={() => set("conservationStatus", option.label)}
                  aria-pressed={selected === option.key}
                >
                  <span className={styles.dot}></span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            Overview
            <textarea
              className={styles.textarea}
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </label>

          <button type="button" className={styles.more} onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen}>
            <i className={`bi ${moreOpen ? "bi-dash-circle" : "bi-plus-circle"}`}></i>
            Morphology, ecology, distribution and uses
          </button>
          {moreOpen &&
            (["morphology", "ecology", "distribution", "uses"] as const).map((key) => (
              <label key={key} className={styles.field}>
                {key[0].toUpperCase() + key.slice(1)}
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              </label>
            ))}
        </div>
      </div>

      <div className={modalStyles.footBar}>
        <span className={modalStyles.footNote}>A QR tag is generated when you save.</span>
        <div className={modalStyles.footButtons}>
          <button type="button" className={modalStyles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={modalStyles.primary} onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save plant"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
