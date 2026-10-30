import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import Navbar from "../../../components/Home/Navbar/Navbar";
import pb from "../../../back-end/db";
import { errorMessage, isNotFound } from "../../../services/errors";
import { parsePlantId } from "../../../services/plantId";
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

  // Show a scan problem and pause briefly, so the same bad code is not looked up 10 times a second
  const rejectScan = useCallback((message: string) => {
    setPlant(null);
    setError(message);
    hasScannedRef.current = true;
    window.setTimeout(() => {
      hasScannedRef.current = false;
    }, 2000);
  }, []);

  // Returns true when the scan led to a plant page
  const fetchPlantAndNavigate = useCallback(async (scanned: string): Promise<boolean> => {
    const plantId = parsePlantId(scanned);
    if (!plantId) {
      rejectScan("This QR code is not a Flora plant tag.");
      return false;
    }

    try {
      await pb.collection("species").getOne(plantId, { fields: "id", requestKey: null });
    } catch (err) {
      rejectScan(
        isNotFound(err)
          ? "This QR code is not a Flora plant tag, or the plant has been removed."
          : errorMessage(err)
      );
      return false;
    }

    // Stop the camera before leaving the page
    if (isScannerRunningRef.current && scannerRef.current) {
      isScannerRunningRef.current = false;
      await scannerRef.current.stop().catch(() => {});
    }
    scannerRef.current = null;
    isScannerRunningRef.current = false;

    navigate(`/discover/plants/${plantId}`);
    return true;
  }, [navigate, rejectScan]);

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
}, [fetchPlantAndNavigate]);

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
        } catch (stopError) {
          console.error("Error stopping camera scanner:", stopError);
        }
      }

      // Create a new scanner instance for file scanning
      const fileScanner = new Html5Qrcode("qr-reader");
      const decodedText = await fileScanner.scanFile(file, true);
      
      const found = await fetchPlantAndNavigate(decodedText);
      if (!found) restartCameraScanner();
    } catch {
      setError("No QR code found in the image. Please try another image.");
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
      }
    } catch (err) {
      console.error("Error restarting camera scanner:", err);
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
