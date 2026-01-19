import "./AboutEcoTagging.css";

const AboutEcoTagging = () => {
  return (
    <section className="about">
      <div className="about-text">
        <h2>What Is the Campus Eco-Tagging Project?</h2>
        <p>
          The Eco-Tagging Project aims to identify and label plant species found on the NDDU campus to promote environmental literacy and awareness. The campus hosts a diverse range of flora; however, information about these plant species is not widely accessible to students, staff, and visitors. Through eco-tagging, each plant will be properly identified and linked to a digital platform that provides relevant ecological information
        </p>

        <button>Read More</button>
      </div>

      <img src="../../assets/nddu-campus.jpg" alt="Eco Tagging" />
    </section>
  );
};

export default AboutEcoTagging;
