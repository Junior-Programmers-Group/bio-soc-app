import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SiteHeader from "../../components/Flora/SiteHeader";
import TabBar from "../../components/Flora/TabBar";
import { useIsMobile } from "../../hooks/useMediaQuery";
import styles from "./NotFound.module.css";

/** Shown for any address the site does not have. */
export default function NotFound() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found · NDDU Flora";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className={`flora ${styles.page}`}>
      {isMobile ? (
        <Link to="/" className={styles.mobileBrand}>
          <img src="/logo-biosoc.png" alt="" />
          <span>NDDU Flora</span>
        </Link>
      ) : (
        <SiteHeader />
      )}

      <main className={styles.main}>
        <span className={styles.eyebrow}>404 · Page not found</span>
        <h1>We couldn&apos;t find that page</h1>
        <p>
          The link may be old, or typed a little differently. If you were scanning a plant tag, try scanning it again.
        </p>
        <span className={styles.path} title={pathname}>
          {pathname}
        </span>

        <div className={styles.actions}>
          <Link to="/discover" className={styles.primary}>
            <i className="bi bi-search"></i>Discover plants
          </Link>
          <Link to="/scan" className={styles.secondary}>
            <i className="bi bi-qr-code-scan"></i>Scan a tag
          </Link>
          <Link to="/" className={styles.text}>
            Go to the home page
          </Link>
        </div>
      </main>

      {isMobile && <TabBar />}
    </div>
  );
}
