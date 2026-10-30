import type { PlantInput } from "../../services/plantAdmin";
import type { Plant } from "../../types/plant";
import { STATUS_OPTIONS, type StatusKey } from "../../lib/status";

/** What the New plant / Edit plant form holds while it is open. */
export interface PlantFormData {
  /** Every common name, separated by " / ", as stored. The first one is the display name. */
  commonName: string;
  scientificName: string;
  /** Id of the selected genus row. */
  genus: string;
  author: string;
  year: string;
  /** The status text saved to the database. */
  conservationStatus: string;
  /** "Overview" in the form. */
  notes: string;
  morphology: string;
  ecology: string;
  distribution: string;
  uses: string;
  imageFile: File | null;
  imagePreview: string;
}

export const EMPTY_FORM: PlantFormData = {
  commonName: "",
  scientificName: "",
  genus: "",
  author: "",
  year: "",
  conservationStatus: "Least Concern",
  notes: "",
  morphology: "",
  ecology: "",
  distribution: "",
  uses: "",
  imageFile: null,
  imagePreview: "",
};

/** Fill the form from an existing plant. */
export const formFromPlant = (plant: Plant): PlantFormData => ({
  commonName: plant.commonNames || plant.commonName,
  scientificName: plant.scientificName,
  genus: plant.genusId ?? "",
  author: plant.author ?? "",
  year: plant.year ? String(plant.year) : "",
  conservationStatus: plant.conservationStatus ?? "",
  notes: plant.notes ?? "",
  morphology: plant.morphology ?? "",
  ecology: plant.ecology ?? "",
  distribution: plant.distribution ?? "",
  uses: plant.uses ?? "",
  imageFile: null,
  imagePreview: plant.image ?? "",
});

/** What the form saves. The image is passed to the service separately. */
export const payloadFromForm = (data: PlantFormData, code?: string): PlantInput => ({
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
  code,
});

/** The next free specimen code: NDDU-0012 after NDDU-0011. */
export const nextSpecimenCode = (plants: Array<Pick<Plant, "code">>): string => {
  const highest = plants.reduce((max, plant) => {
    const n = Number(/^NDDU-(\d+)$/.exec(plant.code ?? "")?.[1] ?? 0);
    return Math.max(max, n);
  }, 0);
  return `NDDU-${String(highest + 1).padStart(4, "0")}`;
};

/** Check an image chosen for upload. Returns a message, or "" when it is fine. */
export const validateImage = (file: File): string => {
  if (!file.type.startsWith("image/")) return "Please choose an image file (JPG or PNG).";
  if (file.size > 5 * 1024 * 1024) return "That image is over 5 MB.";
  return "";
};

/** What is missing before the plant can be saved, or "" when it is ready. */
export const validatePlantForm = (data: PlantFormData, isNew: boolean): string => {
  const missing: string[] = [];
  if (!data.commonName.trim()) missing.push("a common name");
  if (!data.genus) missing.push("a genus");
  if (isNew && !data.imageFile) missing.push("a photo");
  return missing.length ? `Add ${missing.join(", ")} before saving.` : "";
};

/** Which of the three designed status toggles is on (none for other statuses). */
export const toggledStatus = (conservationStatus: string): Exclude<StatusKey, "OTHER"> | null => {
  const text = conservationStatus.trim().toLowerCase();
  return STATUS_OPTIONS.find((s) => text.startsWith(s.label.toLowerCase()))?.key ?? null;
};
