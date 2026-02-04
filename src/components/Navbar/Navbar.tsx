import { useState } from "react";
import styles from "./Navbar.module.css";
import { Link } from "react-router-dom";

const Navbar = ({ variant = "default" }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className={`${styles.navbar} ${styles[variant]}`}>
      {/* LOGO */}
      <div className={styles.navbarLogo}>
        <img src="/Logo.png" alt="BioSoc Eco-Tagging" />
        <span>BioSoc Eco-Tagging</span>
      </div>

      {/* DESKTOP LINKS */}
      <nav className={styles.navbarLinks}>
        <a href="/">Home</a>
        <a href="#plants">Discover Plants</a>
        <a href="#learn">Learn</a>
        <Link to ="/Scan">Scan Plant</Link>
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

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className={styles.mobileMenu}>
          <a href="#directory">Plant Species Directory</a>
          <a href="#education">Educational Content</a>
          <a href="#news">News & Updates</a>
          <a href="#community">Community Engagement</a>
          <a href="#stories">Student Engagement Stories</a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
