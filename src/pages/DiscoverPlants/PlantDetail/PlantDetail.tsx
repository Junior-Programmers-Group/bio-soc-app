import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../../../components/Flora/SiteHeader";
import PlantPhoto from "../../../components/Flora/PlantPhoto";
import type { Plant } from "../../../types/plant";
import { fetchPlantById } from "../../../services/plantService";
import { errorMessage } from "../../../services/errors";
import { statusOf } from "../../../lib/status";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import styles from "./PlantDetail.module.css";

interface Section {
  title: string;
  body: string;
}

/** Share the plant's page: the phone share sheet when there is one, else copy the link. */
function useShare(plant: Plant | null) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (!plant) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: plant.commonName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // the person closed the share sheet: nothing to do
    }
  };

  return { share, copied };
}

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumped by "Try again"

  const [activeSection, setActiveSection] = useState("Overview"); // desktop "On this page"
  const [openSection, setOpenSection] = useState<string | null>("Overview"); // phone accordion
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const { share, copied } = useShare(plant);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      if (!id) {
        setNotFound(true);
        setError("No plant ID provided");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchPlantById(id);
        if (!isMounted) return;
        setPlant(data);
        if (!data) {
          setNotFound(true);
          setError("Plant not found");
        }
      } catch (err) {
        if (!isMounted) return;
        setPlant(null);
        setError(errorMessage(err, "Failed to load plant details"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id, attempt]);

  // Desktop: highlight the section being read
  useEffect(() => {
    if (!plant || isMobile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveSection(visible[0].target.getAttribute("data-section") ?? "Overview");
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [plant, isMobile]);

  const back = () => (window.history.length > 1 ? navigate(-1) : navigate("/discover"));

  if (loading || error || !plant) {
    return (
      <div className="flora">
        {!isMobile && <SiteHeader active="discover" />}
        <div className={styles.state}>
          {loading ? (
            <p className={styles.stateText}>Loading plant details…</p>
          ) : (
            <>
              <h1 className={styles.stateTitle}>{notFound ? "Plant not found" : "We couldn't load this plant"}</h1>
              {!notFound && <p className={styles.stateText}>{error}</p>}
              <div className={styles.stateActions}>
                {!notFound && (
                  <button type="button" className={styles.primaryBtn} onClick={() => setAttempt((n) => n + 1)}>
                    Try again
                  </button>
                )}
                <button type="button" className={styles.secondaryBtn} onClick={() => navigate("/discover")}>
                  Back to Discover
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const status = statusOf(plant.conservationStatus);
  const described = [plant.author, plant.year].filter(Boolean).join(", ");
  const eyebrow = [plant.code, plant.family].filter(Boolean).join(" · ");
  const alsoCalled = (plant.aliases ?? []).join(", ");

  const sections: Section[] = [
    { title: "Overview", body: plant.notes || "No overview available" },
    { title: "Morphology", body: plant.morphology || "No morphology information available" },
    { title: "Ecology", body: plant.ecology || "No ecology information available" },
    { title: "Distribution", body: plant.distribution || "No distribution information available" },
    { title: "Uses", body: plant.uses || "No uses information available" },
  ];

  const facts: Array<{ k: string; v: string; italic?: boolean }> = [
    { k: "Order", v: plant.order || "-" },
    { k: "Family", v: plant.family || "-" },
    { k: "Genus", v: plant.genus || "-", italic: true },
    { k: "Described", v: described || "-" },
  ];

  const ladder: Array<{ rank: string; name: string; italic?: boolean }> = [
    { rank: "Kingdom", name: plant.kingdom || "-" },
    { rank: "Class", name: plant.klass || "-" },
    { rank: "Order", name: plant.order || "-" },
    { rank: "Family", name: plant.family || "-" },
    { rank: "Genus", name: plant.genus || "-", italic: true },
    { rank: "Species", name: plant.scientificName || "-", italic: true },
  ];

  /* ---------------- phone ---------------- */
  if (isMobile) {
    return (
      <div className={`flora ${styles.mobilePage}`}>
        <div className={styles.mobileHero}>
          <PlantPhoto src={plant.image} alt={plant.commonName} stripe={10} label />
          <div className={styles.mobileButtons}>
            <button type="button" className={styles.circleBtn} onClick={back} aria-label="Back">
              <i className="bi bi-arrow-left"></i>
            </button>
            <button type="button" className={styles.circleBtn} onClick={share} aria-label="Share">
              <i className={`bi ${copied ? "bi-check2" : "bi-share"}`}></i>
            </button>
          </div>
        </div>

        <div className={styles.mobileBody}>
          <div className={styles.mobileHead}>
            <span className={styles.mobileEyebrow}>{eyebrow}</span>
            <h1 className={styles.mobileTitle}>{plant.commonName}</h1>
            <span className={styles.mobileSci}>{plant.scientificName}</span>
            <span className={`${styles.mobileBadge} ${status.className}`}>
              <span className={styles.dot6}></span>
              {status.label}
            </span>
          </div>

          <div className={styles.mobileFacts}>
            {facts.map((fact, i) => (
              <div key={fact.k} className={styles.mobileFact} style={i === 0 ? { borderTopColor: "transparent" } : undefined}>
                <span className={styles.factKey}>{fact.k}</span>
                <span className={`${styles.mobileFactValue} ${fact.italic ? styles.italic : ""}`}>{fact.v}</span>
              </div>
            ))}
          </div>

          <div className={styles.accordion}>
            {sections.map((section, i) => {
              const open = openSection === section.title;
              return (
                <div key={section.title} className={styles.accItem} style={i === 0 ? { borderTopColor: "transparent" } : undefined}>
                  <button
                    type="button"
                    className={styles.accHead}
                    onClick={() => setOpenSection(open ? null : section.title)}
                    aria-expanded={open}
                  >
                    <span>{section.title}</span>
                    <i className={`bi ${open ? "bi-dash" : "bi-plus"}`}></i>
                  </button>
                  {open && <p className={styles.accBody}>{section.body}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- desktop ---------------- */
  return (
    <div className="flora">
      <SiteHeader active="discover" />

      <div className={styles.crumbs}>
        <Link to="/discover" className={styles.crumbLink}>
          Discover
        </Link>
        <i className="bi bi-chevron-right"></i>
        <span>{plant.family}</span>
        <i className="bi bi-chevron-right"></i>
        <span className={styles.crumbHere}>{plant.commonName}</span>
      </div>

      <div className={styles.top}>
        <div className={styles.photo}>
          <PlantPhoto src={plant.image} alt={plant.commonName} stripe={12} label labelSize={12} />
        </div>
        <div className={styles.info}>
          <div className={styles.titleBlock}>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h1 className={styles.title}>{plant.commonName}</h1>
            <p className={styles.sciLine}>
              <i>{plant.scientificName}</i> <span className={styles.author}>{plant.author}</span>
            </p>
            {alsoCalled && <p className={styles.aka}>Also called {alsoCalled}</p>}
          </div>

          <div className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.k} className={styles.fact}>
                <span className={styles.factKey}>{fact.k}</span>
                <span className={`${styles.factValue} ${fact.italic ? styles.italic : ""}`}>{fact.v}</span>
              </div>
            ))}
            <div className={styles.fact}>
              <span className={styles.factKey}>Conservation</span>
              <span className={`${styles.badge} ${status.className}`}>
                <span className={styles.dot7}></span>
                {status.label}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.shareBtn} onClick={share}>
              <i className={`bi ${copied ? "bi-check2" : "bi-share"}`}></i>
              {copied ? "Link copied" : "Share"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.lower}>
        <nav className={styles.onPage} aria-label="On this page">
          <span className={styles.onPageLabel}>On this page</span>
          {sections.map((section) => (
            <button
              key={section.title}
              type="button"
              className={`${styles.onPageItem} ${activeSection === section.title ? styles.onPageActive : ""}`}
              onClick={() => {
                setActiveSection(section.title);
                sectionRefs.current[section.title]?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className={styles.content}>
          {sections.map((section) => (
            <div
              key={section.title}
              className={styles.section}
              data-section={section.title}
              ref={(el) => {
                sectionRefs.current[section.title] = el;
              }}
            >
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}

          <div className={styles.classification}>
            <h2>Classification</h2>
            <div className={styles.ladder}>
              {ladder.map((rung) => (
                <div key={rung.rank} className={styles.rung}>
                  <span className={styles.rungRank}>{rung.rank}</span>
                  <span className={`${styles.rungName} ${rung.italic ? styles.italic : ""}`}>{rung.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
