import { useEffect, useState } from "react";
import Navbar from "../../components/Home/Navbar/Navbar";
import SearchBar from "../../components/DiscoverPlant/SearchBar/SearchBar";
import PlantsGrid from "../../components/DiscoverPlant/PlantGrid/PlantsGrid";
import type { Plant } from "../../types/plant";
import { fetchPlants } from "../../services/plantService";
import styles from "./DiscoverPlants.module.css";
import Filters from "../../components/DiscoverPlant/Filters/Filters";

export default function DiscoverPlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPlants = async () => {
      try {
        const data = await fetchPlants();
        if (isMounted) {
          setPlants(data);
        }
      } catch (error) {
        if (isMounted && error instanceof Error && !error.message.includes('aborted')) {
          console.error("Error loading plants:", error);
        }
        if (isMounted) {
          setPlants([]);
        }
      }
    };

    loadPlants();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPlants = plants.filter((plant) =>
    `${plant.commonName} ${plant.scientificName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className={styles.discoverPage}>
      <Navbar />

      <div className={styles.container}>
        <h1>Discover Plants</h1>
        <p>Explore our comprehensive collection of plants and learn about their ecological roles</p>

        {/* SEARCH */}
        <SearchBar search={search} setSearch={setSearch} />

        {/* CONTROL BAR */}
        <div className={styles.controls}>
          <p className={styles.results}>
            {filteredPlants.length} {filteredPlants.length === 1 ? 'Result' : 'Results'}
          </p>

          <div className={styles.actions}>
            <button
              className={styles.filterBtn}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '✕ Hide Filters' : '⚙ Show Filters'}
            </button>

            <select className={styles.sortSelect}>
              <option>Sort By</option>
              <option>Name (A–Z)</option>
              <option>Name (Z–A)</option>
            </select>
          </div>
        </div>

        <div
          className={`${styles.content} ${
            showFilters ? styles.withFilters : styles.noFilters
          }`}
        >
          {showFilters && <Filters />}
          <PlantsGrid plants={filteredPlants} />
        </div>
      </div>
    </div>
  );
}
