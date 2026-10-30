import type { PlantRecord } from "../../../services/plantAdmin";
import { buildImageUrl } from "./plantForm";
import styles from "./ManagePlants.module.css";

interface Props {
  plants: PlantRecord[];
  qrLoading: boolean;
  onEdit: (plant: PlantRecord) => void;
  onOpenQR: (plant: PlantRecord) => void;
  onDelete: (plant: PlantRecord) => void;
}

/** The admin's grid of plant cards with Edit / QR Code / Delete buttons. */
export default function PlantList({ plants, qrLoading, onEdit, onOpenQR, onDelete }: Props) {
  return (
    <div className={styles.plantsGrid}>
      {plants.length === 0 && <p>No plants found</p>}
      {plants.map((plant) => (
        <div key={plant.id} className={styles.plantCard}>
          <img src={buildImageUrl(plant)} alt={plant.commonName} loading="lazy" decoding="async" />
          <div style={{ marginBottom: "10px", paddingTop: "15px", paddingLeft: "15px", paddingRight: "12px" }}>
            <h3 style={{ margin: "0 0 4px 0", lineHeight: "1.2" }}>{plant.commonName}</h3>
            <em style={{ fontSize: "12px", color: "#999", display: "block", fontStyle: "italic" }}>
              {plant.scientificName || ""}
            </em>
          </div>
          <div className={styles.cardActions}>
            <button onClick={() => onEdit(plant)}>Edit</button>
            <button onClick={() => onOpenQR(plant)} disabled={qrLoading} className={styles.qrBtn}>
              QR Code
            </button>
            <button onClick={() => onDelete(plant)} className={styles.deleteBtn}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
