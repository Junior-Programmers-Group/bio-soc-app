import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Home/Navbar/Navbar";
import SearchBar, { type SearchType } from "../../components/DiscoverPlant/SearchBar/SearchBar";
import PlantsGrid from "../../components/DiscoverPlant/PlantGrid/PlantsGrid";
import type { Plant } from "../../types/plant";
import { fetchPlants } from "../../services/plantService";
import styles from "./DiscoverPlants.module.css";
import Filters from "../../components/DiscoverPlant/Filters/Filters";

export default function DiscoverPlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("az");
  const [taxonomyFilter, setTaxonomyFilter] = useState<{ level: string; value: string } | null>(null);
  const [searchParams] = useSearchParams();

  // Initialize search from URL parameters
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadPlants = async () => {
      try {
        const data = await fetchPlants();
        if (isMounted) {
          setPlants(data);
        }
      } catch (error) {
        if (isMounted && error instanceof Error && !error.message.includes("aborted")) {
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

  // Enhanced search across multiple fields with search type filter
  const searchPlants = (plantsToSearch: Plant[]): Plant[] => {
    if (!search.trim()) return plantsToSearch;

    const searchLower = search.toLowerCase();

    return plantsToSearch.filter((plant) => {
      // Determine which fields to search based on searchType
      let searchFields: string[] = [];

      if (searchType === "all") {
        searchFields = [
          plant.commonName || "",
          plant.scientificName || "",
          plant.ecology || "",
          plant.uses || "",
          plant.domain || "",
          plant.kingdom || "",
          plant.phylum || "",
          plant.klass || "",
          plant.order || "",
          plant.family || "",
          plant.subfamily || "",
          plant.genus || "",
          plant.species || "",
          plant.description || "",
        ];
      } else if (searchType === "name") {
        searchFields = [plant.commonName || "", plant.name || ""];
      } else if (searchType === "scientific") {
        searchFields = [plant.scientificName || ""];
      }

      // Use first-letter based search
      return searchFields.some((field) => {
        const fieldLower = field.toLowerCase();
        // Split by spaces and check if any word starts with search term
        const words = fieldLower.split(/\s+/);
        return words.some((word) => word.startsWith(searchLower));
      });
    });
  };

  // Filter by taxonomy if selected
  const filterByTaxonomy = (plantsToFilter: Plant[]): Plant[] => {
    if (!taxonomyFilter) return plantsToFilter;

    const { level, value } = taxonomyFilter;
    
    return plantsToFilter.filter((plant) => {
      const fieldValue = plant[level as keyof Plant];
      return fieldValue === value || (typeof fieldValue === "string" && fieldValue.toLowerCase() === value.toLowerCase());
    });
  };

  // Sorting logic
  const sortPlants = (plantsToSort: Plant[]): Plant[] => {
    const sorted = [...plantsToSort];

    sorted.sort((a, b) => {
      const nameA = a.commonName || "";
      const nameB = b.commonName || "";

      if (sortOrder === "az") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    return sorted;
  };

  const filteredPlants = sortPlants(filterByTaxonomy(searchPlants(plants)));

  return (
    <div className={styles.discoverPage}>
      <Navbar />

      <div className={styles.container}>
        <h1>Discover Plants</h1>
        <p>
          Explore our comprehensive collection of plants and learn about their
          ecological roles
        </p>

        {/* SEARCH */}
        <SearchBar search={search} setSearch={setSearch} searchType={searchType} setSearchType={setSearchType} />

        {/* CONTROL BAR */}
        <div className={styles.controls}>
          <p className={styles.results}>
            {filteredPlants.length}{" "}
            {filteredPlants.length === 1 ? "Result" : "Results"}
          </p>

          <div className={styles.actions}>
            <button
              className={styles.filterBtn}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "✕ Hide Filters" : "⚙ Show Filters"}
            </button>

            <select
              className={styles.sortSelect}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="az">Name (A–Z)</option>
              <option value="za">Name (Z–A)</option>
            </select>
          </div>
        </div>

        <div
          className={`${styles.content} ${
            showFilters ? styles.withFilters : styles.noFilters
          }`}
        >
          {showFilters && <Filters plants={plants} taxonomyFilter={taxonomyFilter} setTaxonomyFilter={setTaxonomyFilter} />}
          <PlantsGrid plants={filteredPlants} />
        </div>
      </div>
    </div>
  );
}