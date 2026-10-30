import { useEffect } from "react";
import {
  MORE_RANKS,
  type RankFilter,
  type RankKey,
  type StatusFilter,
  type StatusRow,
} from "../../../pages/DiscoverPlants/discoverLogic";
import { statusOf } from "../../../lib/status";
import styles from "./Filters.module.css";

interface SelectProps {
  filter: RankFilter;
  onChange: (key: RankKey, value: string) => void;
  /** Phone version: taller, bigger text, no option count. */
  compact?: boolean;
}

/** One rank drop-down (Family, Genus, ...). Genus values are italic. */
function TaxSelect({ filter, onChange, compact = false }: SelectProps) {
  const on = filter.value !== "";
  return (
    <label className={`${styles.field} ${compact ? styles.fieldCompact : ""}`}>
      <span className={styles.fieldLabel}>
        {filter.label}
        {!compact && <span className={styles.fieldCount}>{filter.options.length}</span>}
      </span>
      <div className={styles.selectWrap}>
        <select
          className={`${styles.select} ${on ? styles.selectOn : ""} ${
            filter.key === "genus" && on ? styles.italic : ""
          }`}
          value={filter.value}
          onChange={(e) => onChange(filter.key, e.target.value)}
        >
          <option value="">{filter.any}</option>
          {filter.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <i className={`bi bi-chevron-down ${styles.chevron}`}></i>
      </div>
    </label>
  );
}

interface CommonProps {
  rankFilters: RankFilter[];
  statusRows: StatusRow[];
  status: StatusFilter;
  onStatus: (status: StatusFilter) => void;
  onRank: (key: RankKey, value: string) => void;
  onClear: () => void;
  hasFilter: boolean;
  moreOpen: boolean;
  onToggleMore: () => void;
}

const mainRanks = (filters: RankFilter[]) => filters.filter((f) => !MORE_RANKS.includes(f.key));
const moreRanks = (filters: RankFilter[]) => filters.filter((f) => MORE_RANKS.includes(f.key));

/** Desktop filter sidebar. */
export function FilterSidebar(props: CommonProps) {
  const { rankFilters, statusRows, status, onStatus, onRank, onClear, hasFilter, moreOpen, onToggleMore } = props;
  const moreCount = moreRanks(rankFilters).filter((f) => f.value).length;

  return (
    <aside className={styles.sidebar} aria-label="Filters">
      <div className={styles.sidebarHead}>
        <span className={styles.sidebarTitle}>Filters</span>
        {hasFilter && (
          <button type="button" className={styles.clearAll} onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      {mainRanks(rankFilters).map((filter) => (
        <TaxSelect key={filter.key} filter={filter} onChange={onRank} />
      ))}

      <div className={styles.statusBlock}>
        <span className={styles.statusTitle}>Conservation status</span>
        {statusRows.map((row) => (
          <button
            key={row.key}
            type="button"
            className={`${styles.statusRow} ${status === row.key ? styles.statusRowOn : ""} ${
              row.key === "All" ? styles.dotAll : statusOf(row.label).className
            }`}
            onClick={() => onStatus(row.key)}
            aria-pressed={status === row.key}
          >
            <span className={styles.statusDot}></span>
            <span className={styles.statusLabel}>{row.label}</span>
            <span className={styles.statusCount}>{row.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.moreBlock}>
        <button type="button" className={styles.moreToggle} onClick={onToggleMore} aria-expanded={moreOpen}>
          <span>More classification</span>
          <span className={styles.moreRight}>
            {moreCount > 0 && <span className={styles.moreCount}>{moreCount}</span>}
            <i className={`bi ${moreOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </span>
        </button>
        {moreOpen &&
          moreRanks(rankFilters).map((filter) => (
            <TaxSelect key={filter.key} filter={filter} onChange={onRank} />
          ))}
      </div>
    </aside>
  );
}

interface SheetProps extends CommonProps {
  count: number;
  countWord: string;
  onClose: () => void;
}

/** Phone filter bottom sheet. */
export function FilterSheet(props: SheetProps) {
  const { rankFilters, statusRows, status, onStatus, onRank, onClear, moreOpen, onToggleMore, count, countWord, onClose } = props;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Filters">
        <span className={styles.grab}></span>
        <div className={styles.sheetHead}>
          <h3>Filters</h3>
          <button type="button" className={styles.reset} onClick={onClear}>
            Reset
          </button>
        </div>

        <div className={styles.sheetGrid}>
          {mainRanks(rankFilters).map((filter) => (
            <TaxSelect key={filter.key} filter={filter} onChange={onRank} compact />
          ))}
        </div>

        <div className={styles.chipsBlock}>
          <span className={styles.chipsTitle}>Conservation status</span>
          <div className={styles.chips}>
            {statusRows.map((row) => (
              <button
                key={row.key}
                type="button"
                className={`${styles.chip} ${status === row.key ? styles.chipOn : ""}`}
                onClick={() => onStatus(row.key)}
                aria-pressed={status === row.key}
              >
                {row.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className={styles.sheetMore} onClick={onToggleMore} aria-expanded={moreOpen}>
          <span>More classification</span>
          <i className={`bi ${moreOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
        </button>
        {moreOpen && (
          <div className={styles.sheetGrid}>
            {moreRanks(rankFilters).map((filter) => (
              <TaxSelect key={filter.key} filter={filter} onChange={onRank} compact />
            ))}
          </div>
        )}

        <button type="button" className={styles.show} onClick={onClose}>
          Show {count} {countWord}
        </button>
      </div>
    </div>
  );
}
