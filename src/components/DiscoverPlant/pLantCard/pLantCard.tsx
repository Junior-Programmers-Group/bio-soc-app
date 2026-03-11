import { useNavigate } from "react-router-dom";
import type { PlantClass } from "../../../back-end/types/plantClass";
import styles from "./PlantCard.module.css";
import pb from "../../../back-end/db";

interface Props {
  plant: PlantClass;
}

export default function PlantCard({ plant }: Props) {
  const navigate = useNavigate();

  const imageUrl = plant.image
    ? pb.files.getURL(plant, plant.image)
    : "/River.Tamarind.png";

  return (
    <div
      className={styles.plantCard}
      onClick={() => navigate(`/discover/${plant.id}`)}
    >
      <img src={imageUrl} alt={plant.name} />

      <div className={styles.plantInfo}>
        <h3>{plant.name}</h3>

        <p className={styles.description}>
          {plant.description
            ? plant.description.substring(0, 100)
            : "No description available."}
        </p>
      </div>
    </div>
  );
}
