import { useEffect, useState, useRef, useCallback } from "react";
import { fetchPlants } from "../../../services/plantService";
import type { Plant } from "../../../types/plant";
import SearchDropdown from "./SearchDropdown";
import styles from "./Hero.module.css";

export type SearchType = "all" | "name" | "scientific";

const Hero = () => {
  const [plantCount, setPlantCount] = useState(0);
  const [allPlants, setAllPlants] = useState<Plant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [filteredResults, setFilteredResults] = useState<Plant[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
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
        }
      } catch {
        if (isMounted) setLoadFailed(true);
      } finally {
        if (isMounted) setLoading(false);
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
      const searchLower = searchQuery.trim().toLowerCase();
      
      const results = allPlants.filter((plant) => {
        // Determine which fields to search based on searchType
        let searchFields: string[] = [];

        if (searchType === "all") {
          searchFields = [
            plant.commonName || "",
            ...(plant.aliases ?? []),
            plant.name || "",
            plant.scientificName || "",
            plant.domain || "",
            plant.kingdom || "",
            plant.phylum || "",
            plant.klass || "",
            plant.order || "",
            plant.family || "",
            plant.genus || "",
            plant.species || "",
          ];
        } else if (searchType === "name") {
          searchFields = [plant.commonName || "", ...(plant.aliases ?? []), plant.name || ""];
        } else if (searchType === "scientific") {
          searchFields = [plant.scientificName || ""];
        }

        // The search starts a word of a name: "pine" finds "Fern Pine",
        // and "fern pi" finds it too
        return searchFields.some((field) => {
          const fieldLower = field.toLowerCase();
          return fieldLower.startsWith(searchLower) || fieldLower.includes(" " + searchLower);
        });
      });
      
      
      // Limit results to top 8
      setTotalMatches(results.length);
      setFilteredResults(results.slice(0, 8));
      setShowDropdown(true);
    } else {
      setTotalMatches(0);
      setFilteredResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery, searchType, allPlants]);

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

  const getSearchPlaceholder = (): string => {
    switch (searchType) {
      case "name":
        return "Search by common name...";
      case "scientific":
        return "Search by scientific name...";
      default:
        return "Search by name or scientific name...";
    }
  };

  const toggleFilterOptions = useCallback(() => {
    setShowFilterOptions((prev) => !prev);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Explore Campus Plant Species</h1>
        <p>
          {loadFailed ? (
            "Browse the plant species on campus."
          ) : (
            <>
              Browse all{" "}
              <span className={styles.plantCount}>{loading ? "..." : plantCount}</span>{" "}
              plant species on campus.
            </>
          )}
        </p>
        {loadFailed && (
          <p role="alert">
            We couldn&apos;t load the plant list. Please check your connection and refresh the page.
          </p>
        )}

        {/* Search Type Filter - Collapsible */}
        {showFilterOptions && (
          <div className={styles.searchTypeFilter}>
            <label className={styles.filterLabel}>Search by:</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="searchType"
                  value="all"
                  checked={searchType === "all"}
                  onChange={(e) => setSearchType(e.target.value as SearchType)}
                />
                <span>All</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="searchType"
                  value="name"
                  checked={searchType === "name"}
                  onChange={(e) => setSearchType(e.target.value as SearchType)}
                />
                <span>Common Name</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="searchType"
                  value="scientific"
                  checked={searchType === "scientific"}
                  onChange={(e) => setSearchType(e.target.value as SearchType)}
                />
                <span>Scientific Name</span>
              </label>
            </div>
          </div>
        )}

        <div className={styles.searchContainer}>
          <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={getSearchPlaceholder()}
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
            
            {/* Filter Toggle Button */}
            <button
              type="button"
              className={styles.filterToggleBtn}
              onClick={toggleFilterOptions}
              aria-label="Toggle search filter"
              title="Toggle search filter options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            </button>
          </form>
          
          <div ref={dropdownRef}>
            <SearchDropdown
              results={filteredResults}
              total={totalMatches}
              loading={false}
              query={searchQuery}
              isOpen={showDropdown}
              onClose={() => setShowDropdown(false)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
