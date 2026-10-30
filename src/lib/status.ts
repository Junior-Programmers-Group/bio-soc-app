import styles from "./status.module.css";

export type StatusKey = "LC" | "VU" | "EN" | "OTHER";

export interface StatusInfo {
  key: StatusKey;
  /** Text shown in badges, e.g. "Least Concern". */
  label: string;
  /** Short code for tight spaces, e.g. "LC". */
  short: string;
  /** CSS class that sets --s-bg, --s-fg and --s-dot for this status. */
  className: string;
}

export const STATUS_OPTIONS: Array<{ key: Exclude<StatusKey, "OTHER">; label: string }> = [
  { key: "LC", label: "Least Concern" },
  { key: "VU", label: "Vulnerable" },
  { key: "EN", label: "Endangered" },
];

const classFor: Record<StatusKey, string> = {
  LC: styles.lc,
  VU: styles.vu,
  EN: styles.en,
  OTHER: styles.other,
};

/** "Data Deficient (DD)" -> "DD"; "Not Evaluated (by IUCN)" -> "NE". */
const shortFor = (text: string): string => {
  const code = text.match(/\(([A-Z]{2,3})\)/);
  if (code) return code[1];
  const initials = text
    .replace(/\(.*\)/, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
  return initials.slice(0, 3) || "-";
};

/**
 * Map the free-text conservation status stored in the database to one of the
 * three designed statuses. Anything else (Data Deficient, Not Evaluated, ...)
 * gets a neutral badge that keeps its own wording.
 */
export const statusOf = (text?: string): StatusInfo => {
  const value = (text ?? "").trim();
  const known = STATUS_OPTIONS.find((s) => value.toLowerCase().startsWith(s.label.toLowerCase()));
  if (known) {
    return { key: known.key, label: known.label, short: known.key, className: classFor[known.key] };
  }
  const label = value.replace(/\s*\(.*\)\s*$/, "").trim() || "Not recorded";
  return { key: "OTHER", label, short: shortFor(value || label), className: classFor.OTHER };
};
