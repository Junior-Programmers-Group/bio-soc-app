import "./Navbar.css";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <img src="/images/logo.png" alt="Logo" />
        <span>BioSoc Eco-Tagging</span>
      </div>

      <nav className="navbar-links">
        <a href="/">Home</a>
        <a href="#plants">Discover Plants</a>
        <a href="#learn">Learn</a>
      </nav>
    </header>
  );
};

export default Navbar;
