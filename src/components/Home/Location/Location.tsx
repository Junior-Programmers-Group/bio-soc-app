import React from "react";
import styles from "./Location.module.css";

const Location: React.FC = () => {
  return (
    <section className={styles.location}>
      <div className={styles.locationContainer}>
        
        {/* LEFT: IMAGE */}
        <div className={styles.locationImage}>
          <img
            src="/assets/nddu-campus.jpg" // direct path from public folder
            alt="Notre Dame of Dadiangas University"
          />
          <h3>Notre Dame of Dadiangas University</h3>
        </div>

        {/* RIGHT: TEXT */}
        <div className={styles.locationContent}>
          <h2>Where We Conduct Eco-Tagging</h2>

          <p>
            Notre Dame of Dadiangas University (NDDU) hosts a diverse range of
            plant species across its campus, contributing to ecological balance
            and environmental quality. The campus provides a suitable habitat
            for various flora, making it an important area for biodiversity.
          </p>

          <p>
            NDDU has designated specific areas for conservation efforts, such as
            the Bula Mangrove Area (If you want to learn more about this, click
            here). These initiatives reflect the university’s core value of
            Integrity of Creation, emphasizing the protection and responsible
            use of natural resources. The campus and its conservation sites
            serve as an ideal setting for environmental awareness, biodiversity
            education, research, and sustainable practices.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Location;
