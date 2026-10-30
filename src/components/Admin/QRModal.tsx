import Modal from "./Modal";
import modalStyles from "./modalStyles";
import styles from "./QRModal.module.css";

interface Props {
  plant: { name: string; scientificName: string; code?: string };
  /** The QR image as a data URL, or "" while it is being made. */
  qrCodeDataUrl: string;
  busy: boolean;
  onDownload: () => void;
  onPrint: () => void;
  onClose: () => void;
}

/** "Plant tag": the plant's QR code with Download and Print. */
export default function QRModal({ plant, qrCodeDataUrl, busy, onDownload, onPrint, onClose }: Props) {
  return (
    <Modal title="Plant tag" width={380} onClose={onClose}>
      <div className={styles.body}>
        <div className={styles.qr}>
          {qrCodeDataUrl ? <img src={qrCodeDataUrl} alt={`QR code for ${plant.name}`} /> : <span>QR code</span>}
        </div>
        <span className={styles.name}>{plant.name}</span>
        <span className={styles.sci}>{plant.scientificName}</span>
        {plant.code && <span className={styles.code}>{plant.code}</span>}
      </div>
      <div className={modalStyles.footSplit}>
        <button type="button" className={`${modalStyles.secondary} ${modalStyles.tall}`} onClick={onDownload} disabled={busy}>
          <i className="bi bi-download"></i>Download
        </button>
        <button type="button" className={`${modalStyles.primary} ${modalStyles.tall}`} onClick={onPrint} disabled={busy}>
          <i className="bi bi-printer"></i>Print tag
        </button>
      </div>
    </Modal>
  );
}
