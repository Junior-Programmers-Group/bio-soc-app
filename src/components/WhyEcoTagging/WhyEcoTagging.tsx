import styles from "./WhyEcoTagging.module.css";

const WhyEcoTagging = () => {
  return (
    <section className={styles.whySection}>
      <h2>Why Does the Eco-Tagging Project Matter?</h2>

      <div className={styles.whyCards}>
        <div className={styles.whyCard}>
          <div className={styles.iconCircle}>
            <img src="/Mask group.png" alt="Accessible icon" />
          </div>
          <h3>Accessible</h3>
          <p>
            Students and visitors can quickly access plant information
            using QR codes anywhere on campus.
          </p>
        </div>

        <div className={styles.whyCard}>
          <div className={styles.iconCircle}>
            <img src="/Mask group (1).png" alt="Informative icon" />
          </div>
          <h3>Informative</h3>
          <p>
            Each plant’s details, including its name, ecological role,
            and environmental importance, are clearly presented.
          </p>
        </div>

        <div className={styles.whyCard}>
          <div className={styles.iconCircle}>
            <img src="/Mask group (2).png" alt="Digitalized icon" />
          </div>
          <h3>Digitalized</h3>
          <p>
            Using QR codes modernizes the learning experience, making
            plant education interactive and technology-driven.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyEcoTagging;
