import { useEffect, useRef } from "react";
import styles from "./QRModal.module.css";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName: string;
  scientificName: string;
  qrCodeDataUrl: string;
  onDownload: () => Promise<void>;
  onPrint: () => Promise<void>;
  isLoading?: boolean;
}

export default function QRModal({
  isOpen,
  onClose,
  plantName,
  scientificName,
  qrCodeDataUrl,
  onDownload,
  onPrint,
  isLoading = false,
}: QRModalProps) {
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <div className={styles.header}>
          <h2>QR Code Options</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.qrPreview}>
            <img src={qrCodeDataUrl} alt="Plant QR Code" />
            <p className={styles.previewLabel}>{plantName}</p>
            <p className={styles.previewScientific}>{scientificName}</p>
          </div>

          <div className={styles.info}>
            <p className={styles.infoText}>
              <strong>Plant Name:</strong> {plantName}
            </p>
            <p className={styles.infoText}>
              <strong>Scientific Name:</strong> {scientificName || "N/A"}
            </p>
            <p className={styles.guideText}>
              Works with: Android Camera, iOS Camera & All QR Scanners
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.cancelBtn} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className={styles.printBtn}
            onClick={onPrint}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Print"}
          </button>
          <button 
            className={styles.downloadBtn}
            onClick={onDownload}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
