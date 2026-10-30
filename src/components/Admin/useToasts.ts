import { useCallback, useState } from "react";

export interface Toast {
  id: number;
  type: "success" | "error";
  title: string;
  message: string;
}

const DISMISS_AFTER_MS = 4000;
let nextId = 1;

/** Toast list state. Each toast closes by itself after 4 seconds. */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type: Toast["type"], title: string, message: string) => {
      const id = nextId++;
      setToasts((list) => [...list, { id, type, title, message }]);
      window.setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
    },
    [dismiss]
  );

  return { toasts, push, dismiss };
}
