import { useEffect, useState, useRef } from "react";
import { fetchPlants } from "../../../services/plantService";
import type { Plant } from "../../../types/plant";
import SearchDropdown from "./SearchDropdown";
import styles from "./Hero.module.css";

const Hero = () => {
  const [plantCount, setPlantCount] = useState(0);
  const [allPlants, setAllPlants] = useState<Plant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load all plants on mount
  useEffect(() => {
    let isMounted = true;

    const loadPlants = async () => {
      try {
        const plants = await fetchPlants();
        if (isMounted) {
          setAllPlants(plants);
          setPlantCount(plants.length);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted && error instanceof Error && !error.message.includes('aborted')) {
          console.error("Error fetching plants:", error);
        }
        if (isMounted) {
          setPlantCount(0);
          setLoading(false);
        }
      }
    };

    loadPlants();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter plants based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const results = allPlants.filter((plant) => {
        const searchFields = [
          plant.commonName || "",
          plant.name || "",
          plant.scientificName || "",
          plant.family || "",
        ]
          .join(" ")
          .toLowerCase();

        return searchFields.includes(searchLower);
      });
      
      // Limit results to top 8
      setFilteredResults(results.slice(0, 8));
      setShowDropdown(true);
    } else {
      setFilteredResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery, allPlants]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && filteredResults.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Explore Campus Plant Species</h1>
        <p>
          Browse all{" "}
          <span className={styles.plantCount}>
            {loading ? "..." : plantCount}
          </span>{" "}
          plant species on campus.
        </p>

        <div className={styles.searchContainer}>
          <form className={styles.searchForm}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search plants by species, name, or taxonomy..."
              className={styles.heroInput}
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            <button type="button" className={styles.searchBtn} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </form>
          
          <div ref={dropdownRef}>
            <SearchDropdown
              results={filteredResults}
              loading={false}
              query={searchQuery}
              isOpen={showDropdown}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
