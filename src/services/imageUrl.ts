import pb from "../back-end/db";

/**
 * URL of a file stored on a species record (image, QR code).
 * `thumb` (e.g. "400x300") asks PocketBase for a smaller copy; it returns the
 * original when the field has no thumb sizes configured.
 */
export const getSpeciesFileUrl = (id: string, filename: string, thumb?: string): string =>
  pb.files.getURL({ id, collectionName: "species" }, filename, thumb ? { thumb } : undefined);

/** URL of a species' main image, or "" when it has none. */
export const getSpeciesImageUrl = (
  record: { id: string; field?: string; image?: string },
  thumb?: string
): string => {
  const filename = record.field || record.image;
  return filename ? getSpeciesFileUrl(record.id, filename, thumb) : "";
};
