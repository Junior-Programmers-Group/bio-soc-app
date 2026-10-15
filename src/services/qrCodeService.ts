import QRCode from "qrcode";
import { SITE_URL } from "../config";

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
 * Production URL for QR codes - official domain for bio-soc website
 */
const QR_CODE_BASE_URL = SITE_URL;

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

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Print QR code with plant information
 * Creates a print-friendly page with QR code, plant name, scientific name, and guide text
 */
export const printPlantQRCode = async (
  plantId: string,
  plantName: string,
  scientificName: string
): Promise<void> => {
  try {
    const options: QRCodeOptions = {
      plantId,
      width: 400,
      margin: 2,
      color: { dark: "#2d5016", light: "#ffffff" },
    };

    const qrDataUrl = await generatePlantQRCode(options);

    // Create print window
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) {
      throw new Error("Failed to open print window");
    }

    const safeName = escapeHtml(plantName);
    const safeScientificName = escapeHtml(scientificName);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${safeName} - QR Code</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              padding: 40px 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .container {
              background: white;
              border: 2px solid #2d5016;
              border-radius: 12px;
              padding: 40px;
              max-width: 600px;
              width: 100%;
              text-align: center;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              margin-bottom: 30px;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 20px;
            }
            
            .plant-name {
              font-size: 28px;
              font-weight: 700;
              color: #2d5016;
              margin-bottom: 8px;
            }
            
            .scientific-name {
              font-size: 16px;
              font-style: italic;
              color: #666;
              margin-bottom: 0;
            }
            
            .qr-section {
              margin: 30px 0;
              padding: 20px 0;
              border-bottom: 2px solid #f0f0f0;
            }
            
            .qr-code-img {
              width: 320px;
              height: 320px;
              border: 3px solid #2d5016;
              border-radius: 8px;
              margin: 0 auto;
              display: block;
            }
            
            .guide-text {
              margin: 30px 0;
              padding: 20px;
              background-color: #f9f9f9;
              border-left: 6px solid #2d5016;
              border-radius: 6px;
              font-size: 14px;
              color: #555;
              line-height: 1.6;
              text-align: center;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #f0f0f0;
              font-size: 12px;
              color: #999;
            }
            
            @media print {
              body {
                padding: 0;
                background: white;
              }
              
              .container {
                border: 1px solid #ddd;
                box-shadow: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="plant-name">${safeName}</div>
              <div class="scientific-name">${safeScientificName || "N/A"}</div>
            </div>
            
            <div class="qr-section">
              <img src="${qrDataUrl}" alt="Plant QR Code" class="qr-code-img" />
            </div>
            
            <div class="guide-text">
              Works with: Android Camera, iOS Camera & All QR Scanners
            </div>
            
            <div class="footer">
              <p>Scan this QR code to view plant details online</p>
              <p>Powered by Bio-Soc App</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };
  } catch (error) {
    console.error("Error printing QR code:", error);
    throw new Error("Failed to print QR code");
  }
};
