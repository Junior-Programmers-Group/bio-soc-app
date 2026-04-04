import { useNavigate } from "react-router-dom";
import type { Plant } from "../../../types/plant";
import styles from "./SearchDropdown.module.css";

interface Props {
  results: Plant[];
  loading: boolean;
  query: string;
  isOpen: boolean;
}

export default function SearchDropdown({
  results,
  loading,
  query,
  isOpen,
}: Props) {
  const navigate = useNavigate();

  if (!isOpen || !query.trim()) return null;

  const handlePlantClick = (plantId: string) => {
    navigate(`/discover/${plantId}`);
  };

  const getTaxonomyDisplay = (plant: Plant): string => {
    const taxonomy = [
      plant.domain,
      plant.kingdom,
      plant.phylum,
      plant.klass,
      plant.order,
      plant.family,
      plant.genus,
      plant.species,
    ].filter(Boolean);
    return taxonomy.join(" • ");
  };

  return (
    <div className={styles.dropdown}>
      {loading ? (
        <div className={styles.loading}>
          <p>Searching plants...</p>
        </div>
      ) : results.length > 0 ? (
        <div className={styles.resultsList}>
          {results.map((plant) => (
            <button
              key={plant.id}
              className={styles.resultItem}
              onClick={() => handlePlantClick(plant.id)}
            >
              {plant.image && (
                <img src={plant.image} alt={plant.commonName} className={styles.thumbnail} />
              )}
              <div className={styles.plantInfo}>
                <p className={styles.commonName}>
                  {plant.commonName || plant.name}
                </p>
                <p className={styles.scientificName}>
                  {plant.scientificName || ""}
                </p>
                {/* Only show taxonomy if it contains readable names, not codes */}
                {getTaxonomyDisplay(plant) && (
                  <p className={styles.taxonomy}>
                    {getTaxonomyDisplay(plant)
                      .split(' • ')
                      .filter((tax) => {
                        // Hide any taxonomy part that looks like an ID/code
                        if (/[a-z0-9]{10,}/.test(tax)) return false;
                        return true;
                      })
                      .join(' • ')}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          <p>No plants found matching "{query}"</p>
        </div>
      )}
    </div>
  );
}
