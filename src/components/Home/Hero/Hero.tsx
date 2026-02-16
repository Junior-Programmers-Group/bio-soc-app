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
    const fetchPlantCount = async () => {
      try {
        const plants = await getPlants();
        setPlantCount(plants.length);
      } catch (error) {
        console.error("Error fetching plant count:", error);
        setPlantCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantCount();
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

        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search plants by species, name, or taxonomy..."
            className={styles.heroInput}
            value={searchQuery}
            onChange={handleInputChange}
          />
        </form>
      </div>
    </section>
  );
};

export default Hero;
