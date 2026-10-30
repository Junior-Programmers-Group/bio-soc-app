import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../../../components/Flora/SiteHeader";
import PlantPhoto from "../../../components/Flora/PlantPhoto";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { useQrScanner } from "./useQrScanner";
import styles from "./Scan.module.css";

const CAMERA_ID = "qr-reader";

const STEPS = [
  { n: "01", t: "Find the label", b: "Tags are fixed to the trunk or a stake beside the plant." },
  { n: "02", t: "Allow camera access", b: "Your browser will ask the first time." },
  { n: "03", t: "Hold the code in the frame", b: "The profile opens as soon as it’s recognised." },
];

export default function Scan() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const fileInput = useRef<HTMLInputElement>(null);
  const { phase, plant, message, retry, scanFile, torchSupported, torchOn, toggleTorch } = useQrScanner(
    CAMERA_ID,
    isMobile
  );

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // so the same photo can be chosen again
    if (file) void scanFile(file);
  };
  const chooseImage = () => fileInput.current?.click();
  const openProfile = () => plant && navigate(`/discover/plants/${plant.id}`);

  const input = (
    <input ref={fileInput} type="file" accept="image/*" className={styles.fileInput} onChange={onFile} tabIndex={-1} />
  );

  const scanLine = phase === "scanning" && <div className={styles.scanLine}></div>;

  /* ---------------- phone ---------------- */
  if (isMobile) {
    return (
      <div className={`flora ${styles.mobile}`}>
        <div className={styles.mobileStripes}></div>
        <div id={CAMERA_ID} className={styles.camera}></div>

        <div className={styles.mobileTop}>
          <button type="button" className={styles.glassBtn} onClick={() => navigate("/discover")} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
          <span className={styles.mobileTitle}>Scan a tag</span>
          <button
            type="button"
            className={`${styles.glassBtn} ${torchOn ? styles.glassOn : ""}`}
            onClick={toggleTorch}
            disabled={!torchSupported}
            aria-label="Flash"
            aria-pressed={torchOn}
          >
            <i className="bi bi-lightning-charge"></i>
          </button>
        </div>

        <div className={styles.mobileFrame}>
          <Corners size={40} radius={12} />
          {scanLine}
        </div>
        <p className={styles.mobileHint}>Center the QR code on the plant label</p>

        <div className={styles.mobileCard}>
          {phase === "scanning" && (
            <button type="button" className={styles.mobileSecondary} onClick={chooseImage}>
              <i className="bi bi-image"></i>Choose from photos
            </button>
          )}
          {phase === "found" && plant && (
            <>
              <div className={styles.mobileFound}>
                <div className={styles.mobileThumb}>
                  <PlantPhoto src={plant.thumbnail || plant.image} alt="" stripe={6} />
                </div>
                <div className={styles.foundText}>
                  <span className={styles.mobileName}>{plant.commonName}</span>
                  <span className={styles.mobileSci}>{plant.scientificName}</span>
                </div>
              </div>
              <button type="button" className={styles.mobilePrimary} onClick={openProfile}>
                Open profile
              </button>
            </>
          )}
          {phase === "error" && (
            <>
              <div className={styles.mobileError} role="alert">
                <i className="bi bi-exclamation-triangle"></i>
                {message}
              </div>
              <button type="button" className={styles.mobileSecondary} onClick={retry}>
                Try again
              </button>
            </>
          )}
        </div>
        {input}
      </div>
    );
  }

  /* ---------------- desktop ---------------- */
  return (
    <div className="flora">
      <SiteHeader active="scan" />

      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Scan</span>
            <h1>Identify a plant from its tag</h1>
            <p>Every tagged plant on campus has a QR code on its label. Scan it to open the plant&apos;s profile.</p>
          </div>
          <ol className={styles.steps}>
            {STEPS.map((step) => (
              <li key={step.n}>
                <span className={styles.stepNum}>{step.n}</span>
                <div className={styles.stepText}>
                  <span className={styles.stepTitle}>{step.t}</span>
                  <span className={styles.stepBody}>{step.b}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.panel}>
          <div className={styles.viewport}>
            <div className={styles.stripes}></div>
            <div id={CAMERA_ID} className={styles.camera}></div>
            <span className={styles.cameraLabel}>
              <span className={styles.liveDot}></span>Camera
            </span>
            <div className={styles.frame}>
              <Corners size={36} radius={10} />
              {scanLine}
              {phase === "found" && (
                <div className={styles.foundMark}>
                  <span>
                    <i className="bi bi-check-lg"></i>
                  </span>
                </div>
              )}
            </div>
          </div>

          {phase === "scanning" && (
            <div className={styles.statusRow}>
              <span className={styles.hint}>Hold steady — looking for a QR code</span>
              <button type="button" className={styles.uploadBtn} onClick={chooseImage}>
                <i className="bi bi-upload"></i>Upload an image
              </button>
            </div>
          )}
          {phase === "found" && plant && (
            <div className={styles.foundRow}>
              <div className={styles.thumb}>
                <PlantPhoto src={plant.thumbnail || plant.image} alt="" stripe={6} />
              </div>
              <div className={styles.foundText}>
                <span className={styles.foundName}>{plant.commonName}</span>
                <span className={styles.foundSci}>{plant.scientificName}</span>
              </div>
              <button type="button" className={styles.again} onClick={retry}>
                Scan again
              </button>
              <button type="button" className={styles.openBtn} onClick={openProfile}>
                Open profile<i className="bi bi-arrow-right"></i>
              </button>
            </div>
          )}
          {phase === "error" && (
            <div className={styles.errorBar} role="alert">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{message}</span>
              <button type="button" onClick={retry}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
      {input}
    </div>
  );
}

/** The four white corner brackets of the scan frame. */
function Corners({ size, radius }: { size: number; radius: number }) {
  const style = { width: size, height: size, ["--r" as string]: `${radius}px` };
  return (
    <>
      <span className={`${styles.corner} ${styles.tl}`} style={style}></span>
      <span className={`${styles.corner} ${styles.tr}`} style={style}></span>
      <span className={`${styles.corner} ${styles.bl}`} style={style}></span>
      <span className={`${styles.corner} ${styles.br}`} style={style}></span>
    </>
  );
}
