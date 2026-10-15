// Central place for deployment settings. Values come from .env (see .env.example).

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

/** PocketBase API address. */
export const PB_URL = stripTrailingSlash(
  import.meta.env.VITE_PB_URL || "https://jpg-services.nddu.edu.ph/pb-biosoc"
);

/** Public website address. Encoded into QR codes, so printed tags depend on it. */
export const SITE_URL = stripTrailingSlash(
  import.meta.env.VITE_SITE_URL || "https://flora.nddu.edu.ph"
);
