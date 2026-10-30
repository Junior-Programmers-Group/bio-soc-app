import pb from "../back-end/db";
import type { DetailsRecord, PlantDetailsInput, SpeciesRecord } from "../types/records";
import { clearPlantCache } from "./plantService";
import { errorMessage } from "./errors";

/** A species row joined with its `details` row. */
export interface PlantRecord extends SpeciesRecord, Partial<PlantDetailsInput> {}

/** What the admin form can save: the species fields plus the four detail texts. */
export interface PlantInput extends Partial<PlantDetailsInput> {
  commonName: string;
  scientificName?: string;
  /** Specimen code, e.g. NDDU-0001. Set once when the plant is created. */
  code?: string;
  /** Id of the genus row. */
  genus?: string;
  author?: string;
  year?: number | string;
  conservationStatus?: string;
  notes?: string;
}

const detailsOf = (data: PlantInput): PlantDetailsInput => ({
  morphology: data.morphology ?? "",
  ecology: data.ecology ?? "",
  distribution: data.distribution ?? "",
  uses: data.uses ?? "",
});

/** Request body for the `species` collection. Only real schema fields are sent. */
const speciesBody = (data: PlantInput, imageFile?: File): FormData | Record<string, unknown> => {
  const fields = {
    commonName: data.commonName.trim(),
    scientificName: (data.scientificName ?? "").trim(),
    genus: data.genus ?? "",
    author: (data.author ?? "").trim(),
    conservationStatus: (data.conservationStatus ?? "").trim(),
    notes: (data.notes ?? "").trim(),
  };
  const year = data.year ? Number(data.year) : null;
  // The code is sent only when given (new plants), so editing never renumbers a tagged plant
  const withCode = data.code ? { ...fields, code: data.code } : fields;

  if (!imageFile) return { ...withCode, year };

  const form = new FormData();
  Object.entries(withCode).forEach(([key, value]) => form.append(key, value));
  if (year) form.append("year", String(year));
  form.append("field", imageFile, imageFile.name);
  return form;
};

/** Update the plant's `details` row, creating it if it does not exist. */
async function saveDetails(plantId: string, details: PlantDetailsInput): Promise<void> {
  const existing = await pb.collection("details").getList<DetailsRecord>(1, 1, {
    filter: pb.filter("species = {:id}", { id: plantId }),
    requestKey: null,
  });

  if (existing.items.length > 0) {
    await pb.collection("details").update(existing.items[0].id, { ...details, species: plantId });
  } else {
    await pb.collection("details").create({ species: plantId, ...details });
  }
}

/**
 * Create a plant and its details. If the details cannot be saved the new plant is
 * removed again, so the database never keeps a plant without details.
 */
export async function createPlant(data: PlantInput, imageFile?: File): Promise<PlantRecord> {
  try {
    const record = await pb.collection("species").create<SpeciesRecord>(speciesBody(data, imageFile));

    try {
      await saveDetails(record.id, detailsOf(data));
    } catch (detailsError) {
      try {
        await pb.collection("species").delete(record.id);
      } catch {
        throw new Error(
          `"${data.commonName}" was created, but its description sections could not be saved ` +
            `(${errorMessage(detailsError)}) and the plant could not be removed again. ` +
            `Find it in the list, open Edit and save it again.`
        );
      }
      throw new Error(
        `Nothing was saved: the description sections could not be stored (${errorMessage(detailsError)}).`
      );
    }

    return { ...record, ...detailsOf(data) };
  } finally {
    clearPlantCache();
  }
}

/** Update a plant and its details. Tells the admin if only part of the save worked. */
export async function updatePlant(
  id: string,
  data: PlantInput,
  imageFile?: File
): Promise<PlantRecord> {
  try {
    const record = await pb.collection("species").update<SpeciesRecord>(id, speciesBody(data, imageFile));

    try {
      await saveDetails(id, detailsOf(data));
    } catch (detailsError) {
      throw new Error(
        `The plant information was saved, but the description sections ` +
          `(morphology, ecology, distribution, uses) were not: ${errorMessage(detailsError)}. ` +
          `Please save again.`
      );
    }

    return { ...record, ...detailsOf(data) };
  } finally {
    clearPlantCache();
  }
}

/**
 * Delete a plant and its details. The details go first (they point at the plant);
 * if the plant itself cannot be deleted, the details are put back.
 */
export async function deletePlant(id: string): Promise<void> {
  const rows = await pb.collection("details").getFullList<DetailsRecord>({
    filter: pb.filter("species = {:id}", { id }),
    requestKey: null,
  });

  const removed: DetailsRecord[] = [];
  try {
    for (const row of rows) {
      await pb.collection("details").delete(row.id);
      removed.push(row);
    }
    await pb.collection("species").delete(id);
  } catch (error) {
    const restored = await Promise.allSettled(
      removed.map((row) =>
        pb.collection("details").create({
          id: row.id,
          species: row.species,
          morphology: row.morphology ?? "",
          ecology: row.ecology ?? "",
          distribution: row.distribution ?? "",
          uses: row.uses ?? "",
        })
      )
    );
    if (restored.some((result) => result.status === "rejected")) {
      throw new Error(
        `The plant could not be deleted (${errorMessage(error)}) and its description sections ` +
          `could not be restored. Open the plant and re-enter them.`
      );
    }
    throw error;
  } finally {
    clearPlantCache();
  }
}
