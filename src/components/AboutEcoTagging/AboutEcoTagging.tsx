import { useState } from "react";
import styles from "./AboutEcoTagging.module.css";

const AboutEcoTagging = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="about" className={styles.about}>
      <div className={styles.aboutText}>
        <h2>What Is the Campus Flora Project?</h2>

        <p>
          The Flora Project aims to identify and label plant species found
          on the NDDU campus to promote environmental literacy and awareness.
          The campus hosts a diverse range of flora; however, information about
          these plant species is not widely accessible to students, staff, and
          visitors. Through the Flora Project, each plant will be properly identified and 
          linked to a digital platform that provides relevant ecological information.
        </p>

        {isExpanded && (
          <div
            className={`${styles.readMoreContent} ${
            isExpanded ? styles.expanded : ""
      }`}
        >
      <p>
        This project integrates technology into environmental education by creating 
        an accessible digital plant database. The database will include plant names, 
        ecological roles, conservation status, and environmental importance. By scanning 
        tags or accessing the platform, users can easily learn about each species and understand 
        its role in the ecosystem.

      <br /><br />

        The Flora Project supports sustainability initiatives by building awareness of plant conservation and 
        biodiversity protection. It enhances campus learning by encouraging cross-disciplinary collaboration 
        among students from environmental science, education, and information technology fields. Overall, the 
        project serves as a valuable resource for research, conservation efforts, and environmental education, 
        fostering a deeper appreciation of ecological importance and responsible environmental stewardship.
      </p>
    </div>

        )}

        <button
          className={styles.aboutButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      </div>

      <div className={styles.imageWrapper}>
        <img src="/eco-tagging.webp" alt="Eco Tagging" loading="lazy" decoding="async" />
      </div>
    </section>
  );
};

export default AboutEcoTagging;
