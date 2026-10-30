import type { PlantInput, PlantRecord } from "../../../services/plantAdmin";
import { getSpeciesImageUrl } from "../../../services/imageUrl";

export const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x250/2d5016/ffffff?text=Plant";

export type FormStep = "basic" | "details" | "media";
export type EditTab = "basic" | "morphology" | "ecology" | "distribution" | "uses";
export type FieldType = "text" | "textarea" | "number" | "select";

export const FORM_STEPS: FormStep[] = ["basic", "details", "media"];

export interface PlantFormData {
  commonName: string;
  scientificName: string;
  /** Id of the selected genus row. */
  genus: string;
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

export interface GenusOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  key: keyof PlantFormData;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: GenusOption[];
}

export const EMPTY_FORM: PlantFormData = {
  commonName: "",
  scientificName: "",
  genus: "",
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
};

/** Image URL for a plant, or a placeholder when it has none. */
export const buildImageUrl = (plant: PlantRecord): string =>
  (plant.id && getSpeciesImageUrl(plant)) || PLACEHOLDER_IMAGE;

/** Fill the form from an existing plant (for editing). */
export const formFromPlant = (plant: PlantRecord): PlantFormData => ({
  commonName: plant.commonName || "",
  scientificName: plant.scientificName || "",
  genus: plant.genus || "",
  author: plant.author || "",
  year: plant.year?.toString() || "",
  conservationStatus: plant.conservationStatus || "",
  notes: plant.notes || "",
  imageFile: null,
  imagePreview: buildImageUrl(plant),
  morphology: plant.morphology || "",
  ecology: plant.ecology || "",
  distribution: plant.distribution || "",
  uses: plant.uses || "",
});

/** What the form saves, without the image (which is passed separately). */
export const payloadFromForm = (data: PlantFormData): PlantInput => ({
  commonName: data.commonName,
  scientificName: data.scientificName,
  genus: data.genus,
  author: data.author,
  year: data.year ? Number(data.year) : undefined,
  conservationStatus: data.conservationStatus,
  notes: data.notes,
  morphology: data.morphology,
  ecology: data.ecology,
  distribution: data.distribution,
  uses: data.uses,
});

/** Fields of each step of the "add plant" form. */
export const stepFields = (genusOptions: GenusOption[]): Record<FormStep, FormFieldConfig[]> => ({
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
});

/** Fields shown on each tab of the "edit plant" form. */
export const editTabFields = (genusOptions: GenusOption[]): Record<EditTab, FormFieldConfig[]> => ({
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
});

/** Check an image chosen for upload. Returns an error message, or "" when fine. */
export const validateImage = (file: File): string => {
  if (!file.type.startsWith("image/")) return "Please select a valid image file";
  if (file.size > 5 * 1024 * 1024) return "Image size must be less than 5MB";
  return "";
};
