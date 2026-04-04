import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import Navbar from "../../../components/Home/Navbar/Navbar";
import pb from "../../../back-end/db";
import styles from "./Scan.module.css";

type Plant = {
  commonName: string;
  scientificName: string;
  description?: string;
  image?: string;
  id: string;
  genus?: string;
  author?: string;
  year?: number;
  conservationStatus?: string;
  notes?: string;
};

const Scan = () => {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScannerRunningRef = useRef(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);

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
  let mounted = true;

  const startScanner = async () => {
    // Wait a bit to ensure the DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!mounted) return;

    try {
      const qrReaderElement = document.getElementById("qr-reader");
      if (!qrReaderElement) {
        setError("Camera container not found");
        return;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (hasScannedRef.current) return;

          hasScannedRef.current = true;
          isScannerRunningRef.current = true;
          await fetchPlantAndNavigate(decodedText);
        },
        () => {
          // Suppress verbose error logging
        }
      );
      isScannerRunningRef.current = true;
    } catch (err) {
      if (mounted) {
        setError("Camera permission denied or unavailable. Please allow camera access.");
        console.error("Scanner error:", err);
      }
      isScannerRunningRef.current = false;
    }
  };

  startScanner();

  return () => {
    mounted = false;
    isScannerRunningRef.current = false;
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().catch(() => {
          // Ignore stop errors
        });
      } catch (err) {
        console.error("Error in cleanup:", err);
      }
      scannerRef.current = null;
    }
    hasScannedRef.current = false;
  };
}, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Prevent multiple uploads
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;

    try {
      setError("");
      
      // Stop and cleanup the camera scanner before file scanning
      if (isScannerRunningRef.current && scannerRef.current) {
        try {
          isScannerRunningRef.current = false;
          await scannerRef.current.stop();
          console.log("Camera scanner stopped for file upload");
        } catch (stopError) {
          console.error("Error stopping camera scanner:", stopError);
        }
      }

      // Create a new scanner instance for file scanning
      const fileScanner = new Html5Qrcode("qr-reader");
      const decodedText = await fileScanner.scanFile(file, true);
      
      console.log("QR Code detected from file:", decodedText);
      
      // Navigate immediately without delay
      await fetchPlantAndNavigate(decodedText);
    } catch (scanError) {
      console.error("Scan error:", scanError);
      setError("❌ No QR code found in the image. Please try another image.");
      setPlant(null);
      hasScannedRef.current = false;
      
      // Restart camera scanner on error
      restartCameraScanner();
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const restartCameraScanner = async () => {
    try {
      if (scannerRef.current && !isScannerRunningRef.current) {
        hasScannedRef.current = false;
        
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (hasScannedRef.current) return;

            hasScannedRef.current = true;
            isScannerRunningRef.current = true;
            await fetchPlantAndNavigate(decodedText);
          },
          () => {
            // Suppress verbose error logging
          }
        );
        isScannerRunningRef.current = true;
        console.log("Camera scanner restarted");
      }
    } catch (err) {
      console.error("Error restarting camera scanner:", err);
    }
  };

  const fetchPlantAndNavigate = async (qrCode: string) => {
    try {
      console.log("Fetching plant with QR code:", qrCode);
      
      // Extract plant ID from URL if QR code is a URL
      let plantId = qrCode;
      
      // Check if it's a URL containing plant ID
      const urlMatch = qrCode.match(/plants\/([a-zA-Z0-9]+)/);
      if (urlMatch) {
        plantId = urlMatch[1];
        console.log("Extracted plant ID from URL:", plantId);
      }

      // Try to fetch plant by ID from species collection
      let record;
      try {
        console.log("Trying to fetch plant by ID from 'species' collection:", plantId);
        record = await pb.collection("species").getOne(plantId);
        console.log("Plant found by ID:", record);
      } catch (idError) {
        console.log("Plant not found by ID, trying by QR code field:", qrCode);
        // If not found by ID, try by QR code field in species collection
        try {
          record = await pb.collection("species").getFirstListItem(`qr_code="${qrCode}"`);
          console.log("Plant found by QR code:", record);
        } catch (qrError) {
          // QR code validation failed - this means the scanned code doesn't match any plant
          throw new Error(`❌ Invalid QR code. This code does not correspond to any plant in the database.`);
        }
      }

      // Validate that the extracted plant ID matches the QR code
      if (!record) {
        throw new Error("Plant record not found");
      }

      console.log("Validating QR code for plant:", record.id);
      console.log("Navigating to plant:", record.id);
      
      // Stop scanner if it's running (from camera detection, not from file upload)
      if (isScannerRunningRef.current && scannerRef.current) {
        try {
          isScannerRunningRef.current = false;
          await scannerRef.current.stop().catch(() => {});
          scannerRef.current = null;
        } catch (err) {
          console.error("Error stopping scanner:", err);
          scannerRef.current = null;
        }
      } else {
        // Already stopped (from file upload), just clear reference
        scannerRef.current = null;
        isScannerRunningRef.current = false;
      }
      
      // Navigate immediately
      navigate(`/discover/plants/${record.id}`);
    } catch (err) {
      console.error("Error fetching plant:", err);
      setPlant(null);
      const errorMessage = err instanceof Error ? err.message : "❌ Plant not found in database. Make sure the QR code is valid.";
      setError(errorMessage);
      hasScannedRef.current = false;
    }
  };

  return (
    <>
      {!isMobile && <Navbar />}

      <div className={styles.scanContainer}>
        {isMobile && (
          <button
            className={styles.backButton}
            onClick={() => navigate("/")}
            aria-label="Go back to home"
          >
            ← Back
          </button>
        )}

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
              <img src={plant.image} alt={plant.commonName} />
            )}
            <h2>{plant.commonName}</h2>
            <i>{plant.scientificName}</i>
            <p>{plant.description}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Scan;
