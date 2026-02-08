import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Navbar from "../../../components/Home/Navbar/Navbar";
import pb from "../../../back-end/db";
import styles from "./scan.module.css";

type Plant = {
  name: string;
  scientific_name: string;
  description: string;
  image?: string;
};

const Scan = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);

  const [qr, setQr] = useState("");
  const [plant, setPlant] = useState<Plant | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 useEffect(() => {
  if (scannerRef.current) return;

  const startScanner = () => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (hasScannedRef.current) return;

          hasScannedRef.current = true;
          setQr(decodedText);

          await fetchPlant(decodedText);

          setTimeout(() => {
            scanner.stop().catch(() => {});
          }, 300);
        },
        () => {}
      )
      .catch(() => {
        setError("Camera permission denied or unavailable");
      });
  };


  requestAnimationFrame(startScanner);

  return () => {
    scannerRef.current?.stop().catch(() => {});
    scannerRef.current = null;
    hasScannedRef.current = false;
  };
}, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      const scanner = scannerRef.current || new Html5Qrcode("qr-reader");
      
      const decodedText = await scanner.scanFile(file, true);
      
      setQr(decodedText);
      await fetchPlant(decodedText);
    } catch (err) {
      setError("❌ No QR code found in the image");
      setPlant(null);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fetchPlant = async (qrCode: string) => {
    try {
      const record = await pb
        .collection("plants")
        .getFirstListItem(`qr_code="${qrCode}"`);

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
      {!isMobile && <Navbar />}

      <div className={styles.scanContainer}>
        <h1>Scan Plant QR</h1>

        {/* Camera MUST be rendered before scanner starts */}
        <div id="qr-reader" className={styles.qrBox} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleFileUpload}
        />

        <button
          className={styles.uploadButton}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload QR Code
        </button>

        {error && <p className={styles.error}>{error}</p>}

        {plant && (
          <div className={styles.plantCard}>
            {plant.image && (
              <img src={plant.image} alt={plant.name} />
            )}
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
