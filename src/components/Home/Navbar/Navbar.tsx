import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

const SCROLLED_AFTER_PX = 50;

/**
 * Home page header. Same look as the redesigned header, but transparent over
 * the hero and solid once the page is scrolled. On phones the links move into
 * a menu opened by the hamburger button.
 */
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > SCROLLED_AFTER_PX);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_AFTER_PX);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navItem} ${isActive ? styles.navActive : ""}`;
  const menuClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.menuItem} ${isActive ? styles.menuActive : ""}`;

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <Link to="/" className={styles.brand}>
        <img src="/logo-biosoc.png" alt="BioSoc" className={styles.logo} />
        <span className={styles.name}>NDDU Flora</span>
      </Link>

      <div className={styles.right}>
        <nav className={styles.nav} aria-label="Main">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/discover" className={linkClass}>
            Discover
          </NavLink>
        </nav>
        <Link to="/scan" className={styles.scanBtn}>
          <i className="bi bi-qr-code-scan"></i>Scan a tag
        </Link>
      </div>

      <button
        type="button"
        className={`${styles.menuButton} ${open ? styles.menuButtonOpen : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <div className={styles.menu}>
          <NavLink to="/" end className={menuClass} onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/discover" className={menuClass} onClick={() => setOpen(false)}>
            Discover
          </NavLink>
          <Link to="/scan" className={styles.menuScan} onClick={() => setOpen(false)}>
            <i className="bi bi-qr-code-scan"></i>Scan a tag
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
