import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import type { Plant } from "../../../types/plant";
import { fetchPlantById } from "../../../services/plantService";
import { errorMessage } from "../../../services/errors";
import { parsePlantId } from "../../../services/plantId";

export type ScanPhase = "scanning" | "found" | "error";

export const NOT_A_FLORA_TAG = "This QR code isn't a Flora tag.";
const CAMERA_PROBLEM = "Camera permission denied or unavailable. Please allow camera access.";
const NO_QR_IN_IMAGE = "No QR code found in the image. Please try another image.";

interface Controls {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  scanFile: (file: File) => Promise<void>;
  setTorch: (on: boolean) => Promise<void>;
}

/**
 * Camera and image scanning for the Scan page.
 *
 * Renders the live camera into the element with `elementId`. A recognised Flora
 * tag stops the camera and moves to "found"; anything else moves to "error".
 * `layoutKey` restarts the camera when the page switches between its desktop
 * and phone layouts (the camera element is replaced).
 */
export function useQrScanner(elementId: string, layoutKey: unknown) {
  const [phase, setPhase] = useState<ScanPhase>("scanning");
  const [plant, setPlant] = useState<Plant | null>(null);
  const [message, setMessage] = useState("");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const controls = useRef<Controls | null>(null);

  useEffect(() => {
    let disposed = false;
    let running = false;
    let locked = false; // ignore further decodes while a result is showing
    let starting: Promise<void> | null = null;

    const scanner = new Html5Qrcode(elementId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });

    const stop = async () => {
      if (starting) await starting.catch(() => undefined);
      if (running) {
        running = false;
        try {
          await scanner.stop();
        } catch {
          // already stopped
        }
      }
      setTorchOn(false);
      setTorchSupported(false);
    };

    const fail = (text: string) => {
      locked = true;
      setMessage(text);
      setPhase("error");
    };

    const handleText = async (text: string) => {
      const id = parsePlantId(text);
      if (!id) return fail(NOT_A_FLORA_TAG);
      try {
        const found = await fetchPlantById(id);
        if (!found) return fail(NOT_A_FLORA_TAG);
        await stop();
        if (disposed) return;
        setPlant(found);
        setPhase("found");
      } catch (err) {
        fail(errorMessage(err));
      }
    };

    const start = async () => {
      if (running || starting || disposed) return;
      locked = false;
      starting = (async () => {
        try {
          await scanner.start(
            { facingMode: "environment" },
            { fps: 10 },
            (text) => {
              if (locked) return;
              locked = true;
              void handleText(text);
            },
            () => undefined
          );
          if (disposed) {
            await scanner.stop().catch(() => undefined);
            return;
          }
          running = true;
          try {
            setTorchSupported(scanner.getRunningTrackCameraCapabilities().torchFeature().isSupported());
          } catch {
            setTorchSupported(false);
          }
        } catch {
          if (!disposed) fail(CAMERA_PROBLEM);
        }
      })();
      await starting;
      starting = null;
    };

    controls.current = {
      start,
      stop,
      scanFile: async (file) => {
        locked = true;
        await stop();
        try {
          const text = await scanner.scanFile(file, false);
          await handleText(text);
        } catch {
          fail(NO_QR_IN_IMAGE);
        }
      },
      setTorch: async (on) => {
        try {
          await scanner.getRunningTrackCameraCapabilities().torchFeature().apply(on);
          setTorchOn(on);
        } catch {
          // this camera has no torch
        }
      },
    };

    void start();

    return () => {
      disposed = true;
      controls.current = null;
      void stop().finally(() => {
        try {
          scanner.clear();
        } catch {
          // nothing to clear
        }
      });
    };
  }, [elementId, layoutKey]);

  /** Go back to looking for a code ("Scan again", "Try again"). */
  const retry = useCallback(() => {
    setPhase("scanning");
    setPlant(null);
    setMessage("");
    void controls.current?.start();
  }, []);

  const scanFile = useCallback((file: File) => controls.current?.scanFile(file), []);
  const toggleTorch = useCallback(() => controls.current?.setTorch(!torchOn), [torchOn]);

  return { phase, plant, message, retry, scanFile, torchSupported, torchOn, toggleTorch };
}
