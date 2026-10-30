import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Plant } from "../../../types/plant";
import { statusOf } from "../../../lib/status";
import PlantPhoto from "../../Flora/PlantPhoto";
import styles from "./SearchDropdown.module.css";

interface Props {
  /** The plants to list (the first few matches). */
  results: Plant[];
  /** How many plants match in all. */
  total: number;
  loading: boolean;
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

/** Ranks the search also looks at that the list does not show. */
const HIDDEN_RANKS: Array<{ key: "genus" | "order" | "klass" | "phylum" | "kingdom" | "domain"; label: string }> = [
  { key: "genus", label: "Genus" },
  { key: "order", label: "Order" },
  { key: "klass", label: "Class" },
  { key: "phylum", label: "Phylum" },
  { key: "kingdom", label: "Kingdom" },
  { key: "domain", label: "Domain" },
];

/** Index where `query` starts a word in `text`, or -1. "pine" starts a word in "Fern Pine". */
const wordStart = (text: string, query: string): number => {
  const lower = text.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return -1;
  let from = 0;
  for (;;) {
    const at = lower.indexOf(q, from);
    if (at === -1) return -1;
    if (at === 0 || /[\s/(-]/.test(lower[at - 1])) return at;
    from = at + 1;
  }
};

/** The text with the part that matches the search highlighted. */
function Highlight({ text, query }: { text: string; query: string }) {
  const at = wordStart(text, query);
  if (at === -1) return <>{text}</>;
  const end = at + query.trim().length;
  return (
    <Fragment>
      {text.slice(0, at)}
      <mark className={styles.mark}>{text.slice(at, end)}</mark>
      {text.slice(end)}
    </Fragment>
  );
}

/** Suggestions under the Home search field. Arrow keys move, Enter opens, Esc closes. */
export default function SearchDropdown({ results, total, loading, query, isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const trimmed = query.trim();
  const visible = isOpen && !!trimmed;

  // start from "nothing selected" whenever the suggestions change
  const resultKey = `${trimmed}|${results.map((p) => p.id).join(",")}`;
  const [seenKey, setSeenKey] = useState(resultKey);
  if (seenKey !== resultKey) {
    setSeenKey(resultKey);
    setActive(-1);
  }

  useEffect(() => {
    if (!visible || loading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (results.length === 0) return;
        e.preventDefault();
        const last = results.length - 1;
        setActive((current) =>
          e.key === "ArrowDown" ? (current < last ? current + 1 : 0) : current > 0 ? current - 1 : last
        );
      } else if (e.key === "Enter") {
        e.preventDefault(); // the field is inside a form: do not reload the page
        if (active >= 0 && results[active]) navigate(`/discover/plants/${results[active].id}`);
        else navigate(`/discover?search=${encodeURIComponent(trimmed)}`);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, loading, results, active, trimmed, navigate, onClose]);

  useEffect(() => {
    if (active < 0) return;
    listRef.current?.querySelectorAll<HTMLElement>("[role=option]")[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!visible) return null;

  const discoverLink = `/discover?search=${encodeURIComponent(trimmed)}`;

  return (
    <div className={styles.dropdown}>
      {loading ? (
        <p className={styles.state}>Searching plants…</p>
      ) : results.length === 0 ? (
        <div className={styles.empty} role="status">
          <h3>No plants found</h3>
          <p>
            Nothing matches &ldquo;{trimmed}&rdquo;. Try a common name, a scientific name or a family.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.list} role="listbox" aria-label="Plant suggestions" ref={listRef}>
            {results.map((plant, index) => {
              const status = statusOf(plant.conservationStatus);
              // when the match is not in the name shown, say where it is
              const inName = wordStart(plant.commonName, trimmed) !== -1 || wordStart(plant.scientificName, trimmed) !== -1;
              const alias = inName ? undefined : (plant.aliases ?? []).find((name) => wordStart(name, trimmed) !== -1);
              const hiddenRank =
                inName || alias || wordStart(plant.family ?? "", trimmed) !== -1
                  ? undefined
                  : HIDDEN_RANKS.map(({ key, label }) => ({ label, value: plant[key] ?? "" })).find(
                      (rank) => wordStart(rank.value, trimmed) !== -1
                    );
              return (
                <Link
                  key={plant.id}
                  to={`/discover/plants/${plant.id}`}
                  role="option"
                  aria-selected={index === active}
                  className={`${styles.row} ${status.className} ${index === active ? styles.rowActive : ""}`}
                  onMouseEnter={() => setActive(index)}
                >
                  <span className={styles.thumb}>
                    <PlantPhoto src={plant.thumbnail || plant.image} alt="" stripe={6} />
                  </span>
                  <span className={styles.text}>
                    <span className={styles.name}>
                      <Highlight text={plant.commonName} query={trimmed} />
                    </span>
                    <span className={styles.sci}>
                      <Highlight text={plant.scientificName} query={trimmed} />
                    </span>
                    <span className={styles.meta}>
                      {alias && (
                        <span className={styles.alias}>
                          Also called <Highlight text={alias} query={trimmed} />
                        </span>
                      )}
                      {hiddenRank && (
                        <span className={styles.alias}>
                          {hiddenRank.label}: <Highlight text={hiddenRank.value} query={trimmed} />
                        </span>
                      )}
                      {plant.family && (
                        <span>
                          <Highlight text={plant.family} query={trimmed} />
                        </span>
                      )}
                      <span className={styles.status}>
                        <span className={styles.dot}></span>
                        {status.label}
                      </span>
                    </span>
                  </span>
                  <i className={`bi bi-chevron-right ${styles.chevron}`}></i>
                </Link>
              );
            })}
          </div>
          <div className={styles.footer}>
            <span>
              {total > results.length ? `Showing ${results.length} of ${total} plants` : `${total} ${total === 1 ? "plant" : "plants"}`}
            </span>
            <Link to={discoverLink} className={styles.seeAll}>
              {total > results.length ? "See all in Discover" : "Open in Discover"}
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
