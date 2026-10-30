import type { Toast } from "./useToasts";
import styles from "./Toasts.module.css";

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

/** Stack of toasts in the top right corner. */
export default function Toasts({ toasts, onDismiss }: Props) {
  return (
    <div className={styles.stack} aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast} role={toast.type === "error" ? "alert" : "status"}>
          <span className={`${styles.icon} ${toast.type === "success" ? styles.success : styles.error}`}>
            <i className={`bi ${toast.type === "success" ? "bi-check-lg" : "bi-exclamation-lg"}`}></i>
          </span>
          <div className={styles.text}>
            <span className={styles.title}>{toast.title}</span>
            <span className={styles.message}>{toast.message}</span>
          </div>
          <button type="button" className={styles.close} onClick={() => onDismiss(toast.id)} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      ))}
    </div>
  );
}
