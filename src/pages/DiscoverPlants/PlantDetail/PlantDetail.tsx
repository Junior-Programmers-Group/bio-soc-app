import { useParams } from "react-router-dom";
import Navbar from "../../../components/Home/Navbar/Navbar";
import type { Plant } from "../../../types/plant";
import styles from "./PlantDetail.module.css";

const mockPlant: Plant = {
  id: "example",
  commonName: "River Tamarind",
  scientificName: "Leucaena leucocephala",
  image: "/River.Tamarind.png",
  taxonomy: {
    kingdom: "Plantae",
    order: "Fabales",
    family: "Fabaceae (Legume family)",
    subfamily: "Caesalpinioideae (Mimosoid clade)",
    genus: "Leucaena",
    species: "L. leucocephala",
  },
  description:
    "Common names include white leadtree, white popinac, horse tamarind, ipil-ipil, and koa haole. The specific name leucocephala comes from Greek meaning “white head,” referring to its flowers.",
};

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          <p>Error: No plant ID provided.</p>
        </div>
      </div>
    );
  }

  const plant = mockPlant;

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.card}>
          {/* LEFT IMAGE */}
          <img
            src={plant.image}
            alt={plant.commonName}
            className={styles.image}
          />

          {/* RIGHT CONTENT */}
          <div className={styles.content}>
            <h1 className={styles.title}>{plant.commonName}</h1>
            <div className={styles.scientific}>
              <em>{plant.scientificName}</em>
            </div>

            {/* TABS (visual only for now) */}
            <div className={styles.tabs}>
              <span className={styles.active}>Taxonomy</span>
              <span>Morphology</span>
              <span>Ecology</span>
              <span>Distribution</span>
              <span>Uses</span>
            </div>

            {/* TAXONOMY GRID */}
            <div className={styles.taxonomy}>
              <div><strong>Kingdom:</strong> {plant.taxonomy?.kingdom}</div>
              <div><strong>Order:</strong> {plant.taxonomy?.order}</div>
              <div><strong>Family:</strong> {plant.taxonomy?.family}</div>
              <div><strong>Subfamily:</strong> {plant.taxonomy?.subfamily}</div>
              <div><strong>Genus:</strong> {plant.taxonomy?.genus}</div>
              <div><strong>Species:</strong> {plant.taxonomy?.species}</div>
            </div>

            <p className={styles.description}>{plant.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
