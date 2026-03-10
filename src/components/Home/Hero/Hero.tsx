import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlants } from "../../../services/adminService";
import styles from "./Hero.module.css";

const Hero = () => {
  const [plantCount, setPlantCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPlantCount = async () => {
      try {
        const plants = await getPlants();
        if (isMounted) {
          setPlantCount(plants.length);
        }
      } catch (error) {
        if (isMounted && error instanceof Error && !error.message.includes('aborted')) {
          console.error("Error fetching plant count:", error);
        }
        if (isMounted) {
          setPlantCount(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlantCount();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search plants by species, name, or taxonomy..."
            className={styles.heroInput}
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button type="submit" className={styles.searchBtn} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
};

export default Hero;
