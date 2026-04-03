import { useEffect, useState, useRef, useCallback } from "react";
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
          console.log("✅ Hero: Loaded plants:", plants.length);
          if (plants.length > 0) {
            console.log("📌 First plant data:", plants[0]);
          }
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
      console.log("🔍 Searching for:", searchLower);
      console.log("📊 Total plants:", allPlants.length);
      
      const results = allPlants.filter((plant) => {
        const searchFields = [
          plant.commonName || "",
          plant.name || "",
          plant.scientificName || "",
          plant.domain || "",
          plant.kingdom || "",
          plant.phylum || "",
          plant.klass || "",
          plant.order || "",
          plant.family || "",
          plant.subfamily || "",
          plant.genus || "",
          plant.species || "",
        ];

        const combined = searchFields.join(" ").toLowerCase();
        const isMatch = combined.includes(searchLower);
        
        // Log first few for debugging
        if (allPlants.indexOf(plant) < 2) {
          console.log("Plant:", plant.commonName, "Fields:", searchFields);
        }
        
        return isMatch;
      });
      
      console.log("✓ Found", results.length, "matching plants");
      
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
    
    return undefined;
  }, [showDropdown]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleInputFocus = useCallback(() => {
    if (searchQuery.trim() && filteredResults.length > 0) {
      setShowDropdown(true);
    }
  }, [searchQuery, filteredResults]);

  const handleSearchClick = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (searchQuery.trim() && filteredResults.length > 0) {
      setShowDropdown(true);
    }
  }, [searchQuery, filteredResults]);

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
              placeholder="Search by name, taxonomy (kingdom, family, genus, species)..."
              className={styles.heroInput}
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            <button type="button" className={styles.searchBtn} aria-label="Search" onClick={handleSearchClick}>
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
