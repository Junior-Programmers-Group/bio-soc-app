import { useEffect, useState } from "react";
import { ClientResponseError } from "pocketbase";
import pb from "../back-end/db";

const CHECK_EVERY_MS = 30_000;

const readIsAdmin = () => pb.authStore.isValid && pb.authStore.record?.isAdmin === true;

/**
 * Tracks whether an admin is logged in.
 *
 * - Follows the stored login live: logging in, logging out, or the token running out
 *   all switch the screen without a reload.
 * - On first load, asks the server to refresh the login, so a deleted, demoted or
 *   expired account is signed out instead of seeing a dashboard where every action fails.
 *   If the server cannot be reached the stored login is kept.
 *
 * `ready` is false until that first check finishes.
 */
export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(readIsAdmin);
  const [ready, setReady] = useState(!pb.authStore.isValid);

  useEffect(() => {
    let cancelled = false;
    const sync = () => setIsAdmin(readIsAdmin());

    const unsubscribe = pb.authStore.onChange(sync);
    const timer = window.setInterval(sync, CHECK_EVERY_MS); // token expiry fires no event

    if (pb.authStore.isValid) {
      pb.collection("users")
        .authRefresh({ requestKey: null })
        .catch((error: unknown) => {
          const serverRefused = error instanceof ClientResponseError && error.status >= 400;
          if (serverRefused) pb.authStore.clear();
        })
        .finally(() => {
          if (!cancelled) setReady(true);
        });
    }

    return () => {
      cancelled = true;
      unsubscribe();
      window.clearInterval(timer);
    };
  }, []);

  const logout = () => pb.authStore.clear();

  return { isAdmin, ready, logout };
}
