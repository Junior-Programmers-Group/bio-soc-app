import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Home/Navbar/Navbar";
import type { Plant } from "../../../types/plant";
import { fetchPlantById } from "../../../services/plantService";
import { errorMessage } from "../../../services/errors";
import styles from "./PlantDetail.module.css";

type DetailTab = "taxonomy" | "overview" | "morphology" | "ecology" | "distribution" | "uses";

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumped by "Try again"
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300/2d5016/ffffff?text=Plant";

  useEffect(() => {
    let isMounted = true;

    const loadPlant = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      if (!id) {
        setNotFound(true);
        setError("No plant ID provided");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchPlantById(id);
        if (!isMounted) return;
        setPlant(data);
        if (!data) {
          setNotFound(true);
          setError("Plant not found");
        }
      } catch (err) {
        if (!isMounted) return;
        setPlant(null);
        setError(errorMessage(err, "Failed to load plant details"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPlant();

    return () => {
      isMounted = false;
    };
  }, [id, attempt]);

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
          {!notFound && (
            <button onClick={() => setAttempt((n) => n + 1)} className={styles.backBtn}>
              <span>Try again</span>
            </button>
          )}
          <button onClick={() => navigate("/discover")} className={styles.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 8 12 15 6"></polyline>
            </svg>
            <span>Back to Plants</span>
          </button>
        </div>
      </div>
    );
  }

  const taxonomy = {
    domain: plant.domain,
    kingdom: plant.kingdom,
    phylum: plant.phylum,
    klass: plant.klass,
    order: plant.order,
    family: plant.family,
    genus: plant.genus,
  };
  const details = {
    morphology: plant.morphology,
    ecology: plant.ecology,
    distribution: plant.distribution,
    uses: plant.uses,
  };

  const displayImage = plant.image || PLACEHOLDER_IMAGE;
  const displayName = plant.commonName || plant.name || "Unknown Plant";
  const scientificName = plant.scientificName || "No scientific name";

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.container}>
        <button onClick={() => navigate("/discover")} className={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 8 12 15 6"></polyline>
          </svg>
          <span>Back</span>
        </button>

        <div className={styles.card}>
          {/* LEFT IMAGE */}
          <img
            src={displayImage}
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
                className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
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
            {activeTab === "overview" && (
              <div className={styles.tabContent}>
                <div className={styles.metadata}>
                  {plant.author && <div><strong>Author:</strong> {plant.author}</div>}
                  {plant.year && <div><strong>Year:</strong> {plant.year}</div>}
                  {plant.notes && <div><strong>Notes:</strong> {plant.notes}</div>}
                  {plant.conservationStatus && <div><strong>Conservation Status:</strong> {plant.conservationStatus}</div>}
                </div>
              </div>
            )}

            {activeTab === "taxonomy" && (
              <div className={styles.tabContent}>
                <div className={styles.taxonomyList}>
                  {taxonomy?.domain && <div className={styles.taxonomyItem}><strong>Domain:</strong> <span>{taxonomy.domain}</span></div>}
                  {taxonomy?.kingdom && <div className={styles.taxonomyItem}><strong>Kingdom:</strong> <span>{taxonomy.kingdom}</span></div>}
                  {taxonomy?.phylum && <div className={styles.taxonomyItem}><strong>Division (Phylum):</strong> <span>{taxonomy.phylum}</span></div>}
                  {taxonomy?.klass && <div className={styles.taxonomyItem}><strong>Class:</strong> <span>{taxonomy.klass}</span></div>}
                  {taxonomy?.order && <div className={styles.taxonomyItem}><strong>Order:</strong> <span>{taxonomy.order}</span></div>}
                  {taxonomy?.family && <div className={styles.taxonomyItem}><strong>Family:</strong> <span>{taxonomy.family}</span></div>}
                  {taxonomy?.genus && <div className={styles.taxonomyItem}><strong>Genus:</strong> <span>{taxonomy.genus}</span></div>}
                  {plant.scientificName && <div className={styles.taxonomyItem}><strong>Species:</strong> <span>{plant.scientificName}</span></div>}
                  {!taxonomy || (
                    !taxonomy.domain && 
                    !taxonomy.kingdom && 
                    !taxonomy.phylum && 
                    !taxonomy.klass && 
                    !taxonomy.order && 
                    !taxonomy.family && 
                    !taxonomy.genus
                  ) && (
                    <p className={styles.description}>No taxonomy information available</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "morphology" && (
              <div className={styles.tabContent}>
                <p className={styles.description}>
                  {details?.morphology || "No morphology information available"}
                </p>
              </div>
            )}

            {activeTab === "ecology" && (
              <div className={styles.tabContent}>
                <p className={styles.description}>
                  {details?.ecology || "No ecology information available"}
                </p>
              </div>
            )}

            {activeTab === "distribution" && (
              <div className={styles.tabContent}>
                <p className={styles.description}>
                  {details?.distribution || "No distribution information available"}
                </p>
              </div>
            )}

            {activeTab === "uses" && (
              <div className={styles.tabContent}>
                <p className={styles.description}>
                  {details?.uses || "No uses information available"}
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
