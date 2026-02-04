import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import pb from "../back-end/db";

type Plant = {
  name: string;
  scientific_name: string;
  description: string;
  image?: string;
};

const Scan = () => {
  const [qr, setQr] = useState("");
  const [plant, setPlant] = useState<Plant | null>(null);
  const [error, setError] = useState("");

  const fetchPlant = async () => {
    try {
      const record = await pb
        .collection("plants")
        .getFirstListItem(`qr_code="${qr}"`);

      setPlant({
        name: record.name,
        scientific_name: record.scientific_name,
        description: record.description,
        image: record.image,
      });
      setError("");
    } catch {
      setPlant(null);
      setError("❌ Plant not found");
    }
  };

  return (
    <>
      {/* Navbar at the top */}
      <Navbar />

      <div style={{ padding: "2rem" }}>
        <h1>Scan Plant QR</h1>

        <input
          placeholder="Enter QR code (e.g. PLANT_001)"
          value={qr}
          onChange={(e) => setQr(e.target.value)}
        />

        <button onClick={fetchPlant}>Identify Plant</button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {plant && (
          <div>
            <h2>{plant.name}</h2>
            <i>{plant.scientific_name}</i>
            <p>{plant.description}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Scan;
