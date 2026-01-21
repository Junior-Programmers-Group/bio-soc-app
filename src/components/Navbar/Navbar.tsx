import styles from "./Navbar.module.css";

const Navbar = ({ variant = "default" }) => {
  return (
    <header className={`${styles.navbar} ${styles[variant]}`}>
      <div className={styles.navbarLogo}>
        <img src="/Logo.png" alt="Logo" />
        <span>BioSoc Eco-Tagging</span>
      </div>

      <nav className={styles.navbarLinks}>
        <a href="/">Home</a>
        <a href="#plants">Discover Plants</a>
        <a href="#learn">Learn</a>
      </nav>
    </header>
  );
};

export default Navbar;
