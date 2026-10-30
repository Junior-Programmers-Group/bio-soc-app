import { Link } from "react-router-dom";
import styles from "./TabBar.module.css";

interface Props {
  /** Which tab is highlighted; none on pages that belong to no tab. */
  active?: "discover" | "scan" | "about";
}

/** Bottom tab bar of the public mobile screens. */
export default function TabBar({ active }: Props) {
  return (
    <nav className={styles.bar} aria-label="Main">
      <Link to="/discover" className={`${styles.tab} ${active === "discover" ? styles.active : ""}`}>
        <i className="bi bi-search"></i>Discover
      </Link>
      <Link to="/scan" className={`${styles.tab} ${active === "scan" ? styles.active : ""}`}>
        <i className="bi bi-qr-code-scan"></i>Scan
      </Link>
      <Link to="/#about" className={`${styles.tab} ${active === "about" ? styles.active : ""}`}>
        <i className="bi bi-info-circle"></i>About
      </Link>
    </nav>
  );
}
