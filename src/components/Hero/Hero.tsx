import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Explore Campus Plant Species</h1>
        <p>Browse all 54 plant species on campus.</p>

        <input
          type="text"
          placeholder="Search plants by species, name, or taxonomy..."
        />
      </div>
    </section>
  );
};

export default Hero;
