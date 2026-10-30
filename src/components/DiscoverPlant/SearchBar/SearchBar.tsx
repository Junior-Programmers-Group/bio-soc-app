import { searchPlaceholder, type SearchMode } from "../../../pages/DiscoverPlants/discoverLogic";
import styles from "./SearchBar.module.css";

interface Props {
  query: string;
  onQuery: (value: string) => void;
  mode: SearchMode;
  onMode: (mode: SearchMode) => void;
}

const MODES: Array<{ key: SearchMode; label: string }> = [
  { key: "all", label: "All fields" },
  { key: "name", label: "Common" },
  { key: "sci", label: "Scientific" },
];

/** Desktop search field with the search-mode switch. */
export default function SearchBar({ query, onQuery, mode, onMode }: Props) {
  return (
    <div className={styles.row}>
      <div className={styles.field}>
        <i className={`bi bi-search ${styles.icon}`}></i>
        <input
          className={styles.input}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={searchPlaceholder(mode)}
          aria-label="Search plants"
        />
        {query && (
          <button type="button" className={styles.clear} onClick={() => onQuery("")} title="Clear" aria-label="Clear search">
            <i className="bi bi-x-circle-fill"></i>
          </button>
        )}
      </div>
      <div className={styles.modes} role="group" aria-label="Search in">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`${styles.mode} ${mode === m.key ? styles.modeActive : ""}`}
            onClick={() => onMode(m.key)}
            aria-pressed={mode === m.key}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
