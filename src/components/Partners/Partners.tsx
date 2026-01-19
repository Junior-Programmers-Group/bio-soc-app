import "./Partners.css";

const Partners = () => {
  return (
    <section className="partners">
      <h2>Our Partners</h2>

      <div className="partner-list">
        <div className="partner">
          <img src="/images/jpg.png" />
          <p>Junior Programmers Group</p>
        </div>

        <div className="partner">
          <img src="/images/biosoc.png" />
          <p>BioSociety</p>
        </div>
      </div>
    </section>
  );
};

export default Partners;
