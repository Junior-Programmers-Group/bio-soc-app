import styles from "./AboutEcoTagging.module.css";

const AboutEcoTagging = () => {
  return (
    <section className={styles.about}>
      <div className={styles.aboutText}>
        <h2>What Is the Campus Eco-Tagging Project?</h2>
        <p>
          The Eco-Tagging Project aims to identify and label plant species found
          on the NDDU campus to promote environmental literacy and awareness.
          The campus hosts a diverse range of flora; however, information about
          these plant species is not widely accessible to students, staff, and
          visitors.
        </p>

        <button className={styles.aboutButton}>Read More</button>
      </div>

      <div className={styles.imageWrapper}>
        <img src="/image 4.png" alt="Eco Tagging" />
      </div>
    </section>
  );
};

export default AboutEcoTagging;
