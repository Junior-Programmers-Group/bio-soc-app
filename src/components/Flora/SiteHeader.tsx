import { Link, useNavigate } from "react-router-dom";
import styles from "./SiteHeader.module.css";

interface Props {
  /** Which nav item is highlighted. On the scan page none is. */
  active?: "discover" | "scan";
}

/** Desktop header shared by Discover, Plant Detail and Scan. */
export default function SiteHeader({ active }: Props) {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <img src="/logo-biosoc.png" alt="BioSoc" className={styles.logo} />
        <span className={styles.name}>NDDU Flora</span>
      </Link>
      <div className={styles.right}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navItem}>
            Home
          </Link>
          <Link
            to="/discover"
            className={`${styles.navItem} ${active === "discover" ? styles.navActive : ""}`}
          >
            Discover
          </Link>
        </nav>
        <button
          type="button"
          className={`${styles.scanBtn} ${active === "scan" ? styles.scanActive : ""}`}
          onClick={() => navigate("/scan")}
        >
          <i className="bi bi-qr-code-scan"></i>Scan a tag
        </button>
      </div>
    </header>
  );
}
