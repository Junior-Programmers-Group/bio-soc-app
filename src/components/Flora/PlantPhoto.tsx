import { useState } from "react";
import styles from "./PlantPhoto.module.css";

interface Props {
  src?: string;
  alt: string;
  /** Width of one stripe in the no-photo placeholder, in px. */
  stripe?: number;
  /** Show the "specimen photo" label on the placeholder. */
  label?: boolean;
  /** Font size of that label, in px. */
  labelSize?: number;
}

/**
 * Fills its parent: the photo, or the striped placeholder when the plant has
 * none or the photo fails to load.
 */
export default function PlantPhoto({ src, alt, stripe = 10, label = false, labelSize = 11 }: Props) {
  // remember which address failed, so a new photo gets a fresh chance to load
  const [failedSrc, setFailedSrc] = useState<string | undefined>();

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt={alt}
        className={styles.img}
        loading="lazy"
        decoding="async"
        onError={() => setFailedSrc(src)}
      />
    );
  }
  return (
    <div
      className={styles.stripes}
      style={{ ["--stripe" as string]: `${stripe}px`, fontSize: labelSize }}
      role="img"
      aria-label={`${alt} (no photo yet)`}
    >
      {label && "specimen photo"}
    </div>
  );
}
