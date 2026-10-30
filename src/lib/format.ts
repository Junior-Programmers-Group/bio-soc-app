const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const toDate = (value?: string): Date | null => {
  if (!value) return null;
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "Oct 2" */
export const formatMonthDay = (value?: string): string => {
  const date = toDate(value);
  return date ? `${MONTHS[date.getMonth()]} ${date.getDate()}` : "-";
};

/** "Jan 2026" */
export const formatMonthYear = (value?: string): string => {
  const date = toDate(value);
  return date ? `${MONTHS[date.getMonth()]} ${date.getFullYear()}` : "-";
};

/** Two-letter initials for an avatar, from an email address. */
export const initialsOf = (email: string): string => email.slice(0, 2).toUpperCase();

/**
 * "Buddhist Pine / Fern Pine" -> name "Buddhist Pine", aliases ["Fern Pine"].
 * The database keeps every common name in one text field separated by " / ".
 */
export const splitCommonNames = (full?: string): { name: string; aliases: string[] } => {
  const parts = (full ?? "").split("/").map((part) => part.trim()).filter(Boolean);
  return { name: parts[0] ?? "", aliases: parts.slice(1) };
};
