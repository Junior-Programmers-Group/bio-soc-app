import { Link } from "react-router-dom";
import type { Plant } from "../../../types/plant";
import styles from "./PlantsGrid.module.css";

interface Props {
  plants: Plant[];
}

export default function PlantsGrid({ plants }: Props) {
  return (
    <div className={styles.grid}>
      {plants.map((plant) => (
        <Link
          key={plant.id}
          to={`/discover/${plant.id}`}
          className={styles.card}
        >
          {plant.image && (
            <img
              src={plant.thumbnail || plant.image}
              alt={plant.commonName}
              loading="lazy"
              decoding="async"
            />
          )}
          <h3>{plant.commonName}</h3>
          <em>{plant.scientificName}</em>
        </Link>
      ))}
    </div>
  );
}
