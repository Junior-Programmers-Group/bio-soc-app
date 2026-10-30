import { useEffect, type ReactNode } from "react";
import styles from "./Modal.module.css";

interface Props {
  title: string;
  onClose: () => void;
  /** Dialog width in px (it never gets wider than the screen). */
  width: number;
  /** "large" is the serif title used by the plant form. */
  titleSize?: "small" | "large";
  children: ReactNode;
}

/** Dialog shell: closes on the overlay, the X button and Esc. */
export default function Modal({ title, onClose, width, titleSize = "small", children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className={`${styles.overlay} ${titleSize === "large" ? styles.overlayLarge : ""}`} onClick={onClose}>
      <div
        className={styles.dialog}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={`${styles.head} ${titleSize === "large" ? styles.headLarge : ""}`}>
          <h3>{title}</h3>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
