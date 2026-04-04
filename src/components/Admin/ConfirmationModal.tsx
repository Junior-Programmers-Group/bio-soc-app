import { useEffect, useRef } from "react";
import styles from "./ConfirmationModal.module.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDangerous?: boolean; // For delete confirmations (red styling)
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  isDangerous = false,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${isDangerous ? styles.dangerous : ""}`}
        onClick={(e) => e.stopPropagation()} 
        ref={modalRef}
      >
        <div className={styles.header}>
          <h2 className={isDangerous ? styles.dangerousTitle : ""}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.cancelBtn} 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.confirmBtn} ${isDangerous ? styles.dangerousBtn : ""}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                {isDangerous ? "Deleting..." : "Confirming..."}
              </>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
