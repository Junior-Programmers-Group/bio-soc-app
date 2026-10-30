import type { FormFieldConfig, PlantFormData } from "./plantForm";
import styles from "./ManagePlants.module.css";

interface Props {
  fields: FormFieldConfig[];
  formData: PlantFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlantFormData>>;
}

/** Renders a list of form inputs from a field configuration. */
export default function FormFields({ fields, formData, setFormData }: Props) {
  const set = (key: keyof PlantFormData, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      {fields.map((f) => {
        const id = `plant-field-${f.key}`;
        const value = (formData[f.key] as string) || "";
        const placeholder = f.required ? `${f.label} (required)` : f.label;

        return (
          <div key={f.key} className={styles.formGroup}>
            <label htmlFor={id}>
              {f.label}
              {f.required && <span style={{ color: "#dc2626" }}> *</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                id={id}
                value={value}
                onChange={(e) => set(f.key, e.target.value)}
                required={f.required}
                placeholder={placeholder}
              />
            ) : f.type === "select" ? (
              <select
                id={id}
                value={value}
                onChange={(e) => set(f.key, e.target.value)}
                required={f.required}
              >
                <option value="">
                  {f.key === "genus" && !f.options?.length
                    ? "Loading genus options..."
                    : `Select ${f.label}`}
                </option>
                {f.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                type={f.type}
                value={value}
                onChange={(e) => set(f.key, e.target.value)}
                required={f.required}
                placeholder={placeholder}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
