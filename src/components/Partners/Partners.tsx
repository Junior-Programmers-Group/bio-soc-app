import styles from "./Partners.module.css";

const Partners = () => {
  return (
    <section className={styles.partners}>
      <h2>Our Partners</h2>

      <div className={styles.partnerList}>
        <div className={styles.partner}>
          <img src="/Group 9.png" alt="Junior Programmers Group logo" />
          <p>Junior Programmers Group</p>
        </div>

        <div className={styles.partner}>
          <img src="/Logo (1).png" alt="BioSociety logo" />
          <p>BioSociety</p>
        </div>
      </div>
    </section>
  );
};

export default Partners;
