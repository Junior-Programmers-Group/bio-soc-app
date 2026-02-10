import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Home/Navbar/Navbar";
import type { Plant } from "../../../types/plant";
import { fetchPlantById } from "../../../services/plantService";
import styles from "./PlantDetail.module.css";

type DetailTab = "taxonomy" | "morphology" | "ecology" | "distribution" | "uses";

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<DetailTab>("taxonomy");

  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300/2d5016/ffffff?text=Plant";

  useEffect(() => {
    const loadPlant = async () => {
      if (!id) {
        setError("No plant ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPlantById(id);
        if (data) {
          setPlant(data);
          setError("");
        } else {
          setError("Plant not found");
        }
      } catch (err) {
        console.error("Error loading plant:", err);
        setError("Failed to load plant details");
      } finally {
        setLoading(false);
      }
    };

    loadPlant();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          <p className={styles.loading}>Loading plant details...</p>
        </div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          <p className={styles.error}>{error}</p>
          <button onClick={() => navigate("/discover")} className={styles.backBtn}>
            ← Back to Plants
          </button>
        </div>
      </div>
    );
  }

  const plantImage = plant.image || PLACEHOLDER_IMAGE;
  const displayName = plant.commonName || plant.name || "Unknown Plant";
  const scientificName = plant.scientificName || "No scientific name";

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.container}>
        <button onClick={() => navigate("/discover")} className={styles.backBtn}>
          ← Back
        </button>

        <div className={styles.card}>
          {/* LEFT IMAGE */}
          <img
            src={plantImage}
            alt={displayName}
            className={styles.image}
          />

          {/* RIGHT CONTENT */}
          <div className={styles.content}>
            <h1 className={styles.title}>{displayName}</h1>
            <div className={styles.scientific}>
              <em>{scientificName}</em>
            </div>

            {/* TABS */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "taxonomy" ? styles.active : ""}`}
                onClick={() => setActiveTab("taxonomy")}
              >
                Taxonomy
              </button>
              <button
                className={`${styles.tab} ${activeTab === "morphology" ? styles.active : ""}`}
                onClick={() => setActiveTab("morphology")}
              >
                Morphology
              </button>
              <button
                className={`${styles.tab} ${activeTab === "ecology" ? styles.active : ""}`}
                onClick={() => setActiveTab("ecology")}
              >
                Ecology
              </button>
              <button
                className={`${styles.tab} ${activeTab === "distribution" ? styles.active : ""}`}
                onClick={() => setActiveTab("distribution")}
              >
                Distribution
              </button>
              <button
                className={`${styles.tab} ${activeTab === "uses" ? styles.active : ""}`}
                onClick={() => setActiveTab("uses")}
              >
                Uses
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "taxonomy" && (
              <div className={styles.tabContent}>
                <div className={styles.taxonomy}>
                  {plant.kingdom && <div><strong>Kingdom:</strong> {plant.kingdom}</div>}
                  {plant.order && <div><strong>Order:</strong> {plant.order}</div>}
                  {plant.family && <div><strong>Family:</strong> {plant.family}</div>}
                  {plant.subfamily && <div><strong>Subfamily:</strong> {plant.subfamily}</div>}
                  {plant.species && <div><strong>Species:</strong> {plant.species}</div>}
                </div>
              </div>
            )}

            {activeTab === "morphology" && (
              <div className={styles.tabContent}>
                <p className={styles.description}>
                  {plant.morphology || "No morphology information available"}
                </p>
              </div>
            )}

            {activeTab === "ecology" && (
              <div className={styles.tabContent}>
                <p className={styles.description}>
                  {plant.ecology || "No ecology information available"}
                </p>
              </div>
            )}

            {activeTab === "distribution" && (
              <div className={styles.tabContent}>
                <p className={styles.description}>
                  {plant.distribution || "No distribution information available"}
                </p>
              </div>
            )}

            {activeTab === "uses" && (
              <div className={styles.tabContent}>
                <p className={styles.description}>
                  {plant.uses || "No uses information available"}
                </p>
              </div>
            )}

            {/* Common names */}
            {plant.commonNames && (
              <div className={styles.commonNamesSection}>
                <h4>Common Names</h4>
                <p>{plant.commonNames}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
