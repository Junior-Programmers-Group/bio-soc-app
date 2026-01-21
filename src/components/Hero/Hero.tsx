import styles from "./Hero.module.css";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Explore Campus Plant Species</h1>
        <p>Browse all 54 plant species on campus.</p>

        <input
          type="text"
          placeholder="Search plants by species, name, or taxonomy..."
          className={styles.heroInput}
        />
      </div>
    </section>
  );
};

export default Hero;
