import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { PlantClass } from "../../../back-end/types/plantClass";
import styles from "./PlantCard.module.css";
import pb from "../../../back-end/db";

interface Props {
  plant: PlantClass;
}

export default function PlantCard({ plant }: Props) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    // Use PocketBase SDK to get image URL properly
    try {
      if (plant.image || plant.field) {
        const imageField = plant.image || plant.field;
        const url = pb.files.getURL(plant, imageField);
        // Ensure it's a complete URL
        if (url && !url.startsWith("http")) {
          setImageUrl(pb.baseUrl + url);
        } else {
          setImageUrl(url);
        }
      }
    } catch (error) {
      console.warn("Error loading image:", error);
    }
  }, [plant]);

  if (!imageUrl) return null; // Don't show card if no image

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
