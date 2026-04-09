import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

interface Props {
  variant?: "default" | "home";
}

const Navbar = ({ variant = "default" }: Props) => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`${styles.navbar} ${styles[variant]} ${
        isScrolled && variant === "home" ? styles.scrolled : ""
      }`}
    >
      {/* LOGO */}
      <div className={styles.navbarLogo}>
        <img src="/Logo.png" alt="BioSoc Eco-Tagging" />
        <span>NDDU Flora</span>
      </div>

      {/* DESKTOP LINKS */}
      <nav className={styles.navbarLinks}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Home
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Discover Plants
        </NavLink>

        <NavLink
          to="/scan"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Scan Plant
        </NavLink>
      </nav>

      {/* MOBILE HAMBURGER */}
      <button
        className={`${styles.menuButton} ${open ? styles.open : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* MOBILE MENU */}
      {open && (
        <div className={styles.mobileMenu}>
          <NavLink to="/" onClick={() => setOpen(false)}>
            Home
          </NavLink>

          <NavLink to="/discover" onClick={() => setOpen(false)}>
            Discover Plants
          </NavLink>

          <NavLink to="/scan" onClick={() => setOpen(false)}>
            Scan Plant
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default Navbar;
