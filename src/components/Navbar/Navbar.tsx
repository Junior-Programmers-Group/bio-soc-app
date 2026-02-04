import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { Link } from "react-router-dom";

interface Props {
  variant?: "default" | "home";
}

const Navbar = ({ variant = "default" }: Props) => {
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
<<<<<<< HEAD
        <a href="/">Home</a>
        <a href="#plants">Discover Plants</a>
        <a href="#learn">Learn</a>
        <Link to ="/Scan">Scan Plant</Link>
=======
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Home
        </NavLink>

        <NavLink
          to="/discover-plants"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Discover Plants
        </NavLink>

        <NavLink
          to="/learn"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Learn
        </NavLink>
>>>>>>> 48dfac9bc968066f7a5bda0a0e5fa8ef358e4af2
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

          <NavLink to="/discover-plants" onClick={() => setOpen(false)}>
            Discover Plants
          </NavLink>

          <NavLink to="/learn" onClick={() => setOpen(false)}>
            Learn
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default Navbar;
