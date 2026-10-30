import { useState } from "react";
import { downloadPlantQRCode, generatePlantQRCode, printPlantQRCode } from "../../../services/qrCodeService";
import { errorMessage } from "../../../services/errors";

export interface QRPlant {
  id: string;
  commonName: string;
  scientificName: string;
}

interface Callbacks {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

/** State and actions behind the QR code pop-up (view, download, print). */
export function usePlantQRModal({ onError, onSuccess }: Callbacks) {
  const [plant, setPlant] = useState<QRPlant | null>(null);
  const [dataUrl, setDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const close = () => {
    setPlant(null);
    setDataUrl("");
  };

  const open = async (target: QRPlant) => {
    try {
      setIsLoading(true);
      onError("");
      setDataUrl(await generatePlantQRCode({ plantId: target.id, width: 400 }));
      setPlant(target);
    } catch (err) {
      onError(errorMessage(err, "Failed to generate QR code"));
    } finally {
      setIsLoading(false);
    }
  };

  const run = async (action: (p: QRPlant) => Promise<void>, done: string, failed: string) => {
    if (!plant) return;
    try {
      setIsLoading(true);
      await action(plant);
      onSuccess(done);
      close();
    } catch (err) {
      onError(errorMessage(err, failed));
    } finally {
      setIsLoading(false);
    }
  };

  const download = () =>
    run((p) => downloadPlantQRCode(p.id, p.commonName), "QR Code downloaded successfully!", "Failed to download QR code");

  const print = () =>
    run((p) => printPlantQRCode(p.id, p.commonName, p.scientificName), "Print dialog opened!", "Failed to print QR code");

  return { isOpen: plant !== null, plant, dataUrl, isLoading, open, close, download, print };
}
