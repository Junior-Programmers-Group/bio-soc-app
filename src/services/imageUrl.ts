import pb from "../back-end/db";

/** URL of a file stored on a species record (image, QR code). */
export const getSpeciesFileUrl = (id: string, filename: string): string =>
  pb.files.getURL({ id, collectionName: "species" }, filename);

/** URL of a species' main image, or "" when it has none. */
export const getSpeciesImageUrl = (record: {
  id: string;
  field?: string;
  image?: string;
}): string => {
  const filename = record.field || record.image;
  return filename ? getSpeciesFileUrl(record.id, filename) : "";
};
