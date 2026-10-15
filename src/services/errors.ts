import { ClientResponseError } from "pocketbase";

/** True when the server answered 404 (record or collection not found). */
export const isNotFound = (err: unknown): boolean =>
  err instanceof ClientResponseError && err.status === 404;

/**
 * Turn any error into a sentence a visitor or admin can act on.
 * Errors we throw ourselves keep their own message.
 */
export const errorMessage = (
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  if (err instanceof ClientResponseError) {
    if (err.isAbort) return "The request was cancelled. Please try again.";
    if (err.status === 0) {
      return "Can't reach the server. Check your internet connection and try again.";
    }
    if (err.status === 401) return "Your session has expired. Please log in again.";
    if (err.status === 403) return "You don't have permission to do that.";
    if (err.status === 404) return "That item could not be found. It may have been deleted.";
    if (err.status === 429) return "Too many requests. Please wait a moment and try again.";
    if (err.status >= 500) return "The server had a problem. Please try again in a few minutes.";
    if (err.status === 400) {
      const fields = Object.entries(err.response?.data ?? {}).map(
        ([name, info]) => `${name}: ${(info as { message?: string })?.message ?? "invalid"}`
      );
      if (fields.length > 0) return fields.join("; ");
      return err.response?.message || fallback;
    }
    return fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};
