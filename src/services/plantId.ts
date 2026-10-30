// Plant tags hold <site>/discover/plants/<id>. PocketBase ids are 15 letters/digits.
const PLANT_ID = /^[a-z0-9]{15}$/i;

/** The plant id inside a scanned tag, or null if the text is not a Flora tag. */
export const parsePlantId = (scanned: string): string | null => {
  const text = scanned.trim();
  const fromUrl = text.match(/\/plants\/([a-z0-9]{15})(?:[/?#]|$)/i);
  const id = fromUrl ? fromUrl[1] : text;
  return PLANT_ID.test(id) ? id : null;
};
