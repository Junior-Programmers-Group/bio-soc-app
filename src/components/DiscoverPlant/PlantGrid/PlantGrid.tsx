import { Link } from "react-router-dom";
import type { Plant } from "../../../types/plant";
import { statusOf } from "../../../lib/status";
import PlantPhoto from "../../Flora/PlantPhoto";
import styles from "./PlantGrid.module.css";

const plantPath = (plant: Plant) => `/discover/plants/${plant.id}`;

/** Photo for lists and cards: the small thumbnail when there is one. */
const photoOf = (plant: Plant) => plant.thumbnail || plant.image;

interface GridProps {
  plants: Plant[];
  /** 4 columns while the filter sidebar is hidden, 3 while it is shown. */
  columns: 3 | 4;
}

/** Desktop grid of plant cards. Cards carry no specimen code. */
export function PlantCards({ plants, columns }: GridProps) {
  return (
    <div className={`${styles.grid} ${columns === 3 ? styles.threeCols : styles.fourCols}`}>
      {plants.map((plant) => {
        const status = statusOf(plant.conservationStatus);
        return (
          <Link key={plant.id} to={plantPath(plant)} className={styles.card}>
            <div className={styles.photo}>
              <PlantPhoto src={photoOf(plant)} alt={plant.commonName} stripe={10} label />
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardName}>{plant.commonName}</h3>
              <span className={styles.sci}>{plant.scientificName}</span>
              <div className={`${styles.cardFoot} ${status.className}`}>
                <span>{plant.family}</span>
                <span className={styles.sep}></span>
                <span className={styles.status}>
                  <span className={styles.dot7}></span>
                  {status.label}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/** Desktop list view: one card of rows. */
export function PlantRows({ plants }: { plants: Plant[] }) {
  return (
    <div className={styles.list}>
      {plants.map((plant) => {
        const status = statusOf(plant.conservationStatus);
        return (
          <Link key={plant.id} to={plantPath(plant)} className={`${styles.row} ${status.className}`}>
            <div className={styles.thumb}>
              <PlantPhoto src={photoOf(plant)} alt="" stripe={6} />
            </div>
            <div className={styles.rowName}>
              <span className={styles.rowTitle}>{plant.commonName}</span>
              <span className={styles.rowSci}>{plant.scientificName}</span>
            </div>
            <span className={styles.rowFamily}>{plant.family}</span>
            <span className={`${styles.status} ${styles.rowStatus}`}>
              <span className={styles.dot7}></span>
              {status.label}
            </span>
            <i className={`bi bi-chevron-right ${styles.rowChevron}`}></i>
          </Link>
        );
      })}
    </div>
  );
}

/** Phone list of plant cards. */
export function PlantCardsMobile({ plants }: { plants: Plant[] }) {
  return (
    <div className={styles.mobileList}>
      {plants.map((plant) => {
        const status = statusOf(plant.conservationStatus);
        return (
          <Link key={plant.id} to={plantPath(plant)} className={`${styles.mobileCard} ${status.className}`}>
            <div className={styles.mobileThumb}>
              <PlantPhoto src={photoOf(plant)} alt="" stripe={6} />
            </div>
            <div className={styles.mobileText}>
              <span className={styles.mobileName}>{plant.commonName}</span>
              <span className={styles.mobileSci}>{plant.scientificName}</span>
              <span className={styles.mobileStatus}>
                <span className={styles.dot6}></span>
                {status.label}
              </span>
            </div>
            <i className={`bi bi-chevron-right ${styles.mobileChevron}`}></i>
          </Link>
        );
      })}
    </div>
  );
}

interface EmptyProps {
  title: string;
  message: string;
  action: string;
  onAction: () => void;
}

/** "No plants found" box (also used for a failed load). */
export function EmptyState({ title, message, action, onAction }: EmptyProps) {
  return (
    <div className={styles.empty} role="status">
      <h3>{title}</h3>
      <p>{message}</p>
      <button type="button" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}
