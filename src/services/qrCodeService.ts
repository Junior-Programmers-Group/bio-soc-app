import QRCode from "qrcode";

interface QRCodeOptions {
  plantId: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Production URL for QR codes - works everywhere on campus
 */
const QR_CODE_BASE_URL = "http://jpg-services.nddu.edu.ph:10001";

/**
 * Generate absolute URL for plant details page
 * Works with native phone cameras (Android, iOS) and universal QR scanners
 * Uses production domain so it works on any network (WiFi or data)
 */
const getPlantUrl = (plantId: string): string => {
  return `${QR_CODE_BASE_URL}/discover/plants/${plantId}`;
};

export const generatePlantQRCode = async (
  options: QRCodeOptions
): Promise<string> => {
  const {
    plantId,
    errorCorrectionLevel = "H",
    width = 300,
    margin = 2,
    color = { dark: "#2d5016", light: "#ffffff" },
  } = options;

  // Use absolute URL for universal QR scanner compatibility
  const qrUrl = getPlantUrl(plantId);

  try {
    const dataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel,
      type: "image/png",
      width,
      margin,
      color,
    });
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};


export const generatePlantQRCodeCanvas = async (
  options: QRCodeOptions
): Promise<HTMLCanvasElement> => {
  const {
    plantId,
    errorCorrectionLevel = "H",
    width = 300,
    margin = 2,
    color = { dark: "#2d5016", light: "#ffffff" },
  } = options;

  // Use absolute URL for universal QR scanner compatibility
  const qrUrl = getPlantUrl(plantId);
  const canvas = document.createElement("canvas");

  try {
    await QRCode.toCanvas(canvas, qrUrl, {
      errorCorrectionLevel,
      width,
      margin,
      color,
    });
    return canvas;
  } catch (error) {
    console.error("Error generating QR code canvas:", error);
    throw new Error("Failed to generate QR code");
  }
};


export const downloadPlantQRCode = async (
  plantId: string,
  plantName: string
): Promise<void> => {
  try {
    const options: QRCodeOptions = {
      plantId,
      width: 400,
      margin: 2,
      color: { dark: "#2d5016", light: "#ffffff" },
    };

    const dataUrl = await generatePlantQRCode(options);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${plantName}_QR_Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading QR code:", error);
    throw new Error("Failed to download QR code");
  }
};

/**
 * Generate QR code as blob (for database storage)
 */
export const generateQRCodeBlob = async (
  options: QRCodeOptions
): Promise<Blob> => {
  const {
    plantId,
    errorCorrectionLevel = "H",
    width = 300,
    margin = 2,
    color = { dark: "#2d5016", light: "#ffffff" },
  } = options;

  // Use absolute URL for universal QR scanner compatibility
  const qrUrl = getPlantUrl(plantId);

  return new Promise((resolve, reject) => {
    QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel,
      type: "image/png",
      width,
      margin,
      color,
    })
      .then((dataUrl: string) => {
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => resolve(blob))
          .catch(reject);
      })
      .catch(reject);
  });
};
