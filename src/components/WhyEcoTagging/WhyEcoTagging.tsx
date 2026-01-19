import "./WhyEcoTagging.css";
import { Leaf, Info, Smartphone } from "lucide-react";

const WhyEcoTagging = () => {
  return (
    <section className="why-section">
      <h2>Why Does the Eco-Tagging Project Matter?</h2>

      <div className="why-cards">
        <div className="why-card">
          <div className="icon-circle">
            <Info size={22} />
          </div>
          <h3>Accessible</h3>
          <p>
            Students and visitors can quickly access plant information
            using QR codes anywhere on campus.
          </p>
        </div>

        <div className="why-card">
          <div className="icon-circle">
            <Leaf size={22} />
          </div>
          <h3>Informative</h3>
          <p>
            Each plant’s details, including its name, ecological role,
            and environmental importance, are clearly presented.
          </p>
        </div>

        <div className="why-card">
          <div className="icon-circle">
            <Smartphone size={22} />
          </div>
          <h3>Digitalized</h3>
          <p>
            Using QR codes modernizes the learning experience, making
            plant education interactive and technology-driven.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyEcoTagging;
