import { useNavigate } from "react-router-dom";
import type { Plant } from "../../../types/plant";
import styles from "./PlantCard.module.css";

interface Props {
  plant: Plant;
}

export default function PlantCard({ plant }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className={styles.plantCard}
      onClick={() => navigate(`/discover/${plant.id}`)}
    >
      <img src="/River.Tamarind.png" alt="River Tamarind" />



      <div className={styles.plantInfo}>
        <h3>{plant.commonName}</h3>
        <p>{plant.scientificName}</p>
      </div>
    </div>
  );
}
