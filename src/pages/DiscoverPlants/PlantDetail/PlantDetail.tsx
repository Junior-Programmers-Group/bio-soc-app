import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Home/Navbar/Navbar";
import type { Plant } from "../../../types/plant";
import { fetchPlantById, fetchTaxonomyHierarchy } from "../../../services/plantService";
import pb from "../../../back-end/db";
import styles from "./PlantDetail.module.css";

type DetailTab = "taxonomy" | "overview" | "morphology" | "ecology" | "distribution" | "uses";

interface PlantDetails {
  morphology?: string;
  ecology?: string;
  distribution?: string;
  uses?: string;
}

interface TaxonomyHierarchy {
  domain?: string;
  kingdom?: string;
  phylum?: string;
  klass?: string;
  order?: string;
  family?: string;
  genus?: string;
}

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [details, setDetails] = useState<PlantDetails | null>(null);
  const [taxonomy, setTaxonomy] = useState<TaxonomyHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const PLACEHOLDER_IMAGE = "/River.Tamarind.png";

  useEffect(() => {
    let isMounted = true;

    const loadPlant = async () => {
      if (!id) {
        if (isMounted) {
          setError("No plant ID provided");
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
        }
        
        // Fetch plant data
        const plantData = await fetchPlantById(id);
        if (isMounted && plantData) {
          setPlant(plantData);
          setError("");
          
          console.log("🌿 Plant data received:", {
            commonName: plantData.commonName,
            genus: plantData.genus,
            genusId: plantData.genusId,
          });
          
          // Fetch taxonomy hierarchy from genus
          if (plantData.genus || plantData.genusId) {
            try {
              // Use genusId if available, otherwise use genus (which may be the ID)
              const genusIdentifier = (plantData.genusId || plantData.genus) as string;
              console.log("📚 Fetching taxonomy for genus:", genusIdentifier);
              const taxonomyData = await fetchTaxonomyHierarchy(genusIdentifier);
              if (isMounted) {
                setTaxonomy(taxonomyData);
                console.log("✓ Taxonomy hierarchy loaded:", taxonomyData);
              }
            } catch (taxError) {
              console.error("❌ Error loading taxonomy hierarchy:", taxError);
            }
          } else {
            console.warn("⚠️ No genus or genusId available for plant:", plantData.commonName);
          }
          
          // Fetch details from details collection
          try {
            const detailsRecord = await pb.collection("details").getFirstListItem(
              `species = "${id}"`,
              { requestKey: null }
            );
            if (isMounted) {
              setDetails({
                morphology: detailsRecord.morphology || "",
                ecology: detailsRecord.ecology || "",
                distribution: detailsRecord.distribution || "",
                uses: detailsRecord.uses || "",
              });
              console.log("✓ Plant details loaded from details collection");
            }
          } catch (detailsError) {
            if (isMounted && (detailsError as any).message?.includes("Failed to find a record")) {
              // No details record found, that's okay
              console.log("No details record found for this plant");
              setDetails(null);
            } else {
              console.warn("Error loading details:", detailsError);
            }
          }
        } else if (isMounted) {
          setError("Plant not found");
        }
      } catch (err) {
        if (isMounted && err instanceof Error && !err.message.includes('aborted')) {
          console.error("Error loading plant:", err);
          setError("Failed to load plant details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPlant();

    return () => {
      isMounted = false;
    };
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 8 12 15 6"></polyline>
            </svg>
            <span>Back to Plants</span>
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 8 12 15 6"></polyline>
          </svg>
          <span>Back</span>
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
