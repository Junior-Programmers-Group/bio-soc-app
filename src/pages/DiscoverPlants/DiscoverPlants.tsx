import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SiteHeader from "../../components/Flora/SiteHeader";
import TabBar from "../../components/Flora/TabBar";
import SearchBar from "../../components/DiscoverPlant/SearchBar/SearchBar";
import { FilterSheet, FilterSidebar } from "../../components/DiscoverPlant/Filters/Filters";
import {
  EmptyState,
  PlantCards,
  PlantCardsMobile,
  PlantRows,
} from "../../components/DiscoverPlant/PlantGrid/PlantGrid";
import type { Plant } from "../../types/plant";
import { fetchPlants } from "../../services/plantService";
import { errorMessage } from "../../services/errors";
import { STATUS_OPTIONS } from "../../lib/status";
import { useIsMobile } from "../../hooks/useMediaQuery";
import {
  buildRankFilters,
  buildStatusRows,
  chooseRank,
  matchesQuery,
  visiblePlants,
  type RankKey,
  type SearchMode,
  type StatusFilter,
  type Taxonomy,
} from "./discoverLogic";
import styles from "./DiscoverPlants.module.css";

export default function DiscoverPlants() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0); // bumped by "Try again"

  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [mode, setMode] = useState<SearchMode>("all");
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({});
  const [status, setStatus] = useState<StatusFilter>("All");
  const [moreOpen, setMoreOpen] = useState(false);
  const [sort, setSort] = useState<"az" | "za">("az");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false); // desktop sidebar, hidden by default
  const [sheetOpen, setSheetOpen] = useState(false); // phone bottom sheet

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await fetchPlants();
        if (isMounted) setPlants(data);
      } catch (error) {
        if (isMounted) {
          setPlants([]);
          setLoadError(errorMessage(error, "We couldn't load the plants."));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [attempt]);

  const searched = useMemo(() => plants.filter((p) => matchesQuery(p, query, mode)), [plants, query, mode]);
  const rankFilters = useMemo(() => buildRankFilters(searched, taxonomy), [searched, taxonomy]);
  const statusRows = useMemo(() => buildStatusRows(searched, taxonomy), [searched, taxonomy]);
  const items = useMemo(
    () => visiblePlants(plants, query, mode, taxonomy, status, sort),
    [plants, query, mode, taxonomy, status, sort]
  );

  const onRank = (key: RankKey, value: string) => {
    setTaxonomy((current) => chooseRank(current, plants, key, value));
  };

  const chips = [
    ...rankFilters
      .filter((f) => f.value)
      .map((f) => ({ rank: f.label, value: f.value, remove: () => onRank(f.key, "") })),
    ...(status !== "All"
      ? [
          {
            rank: "Status",
            value: STATUS_OPTIONS.find((s) => s.key === status)?.label ?? status,
            remove: () => setStatus("All"),
          },
        ]
      : []),
  ];
  const hasFilter = chips.length > 0;
  const countWord = items.length === 1 ? "plant" : "plants";

  const clearFilters = () => {
    setTaxonomy({});
    setStatus("All");
  };
  const clearAll = () => {
    setQuery("");
    setTaxonomy({});
    setStatus("All");
    setMode("all");
  };
  const toggleSort = () => setSort((s) => (s === "az" ? "za" : "az"));
  const sortLabel = sort === "az" ? "A–Z" : "Z–A";

  const filterProps = {
    rankFilters,
    statusRows,
    status,
    onStatus: setStatus,
    onRank,
    onClear: clearFilters,
    hasFilter,
    moreOpen,
    onToggleMore: () => setMoreOpen((open) => !open),
  };

  const results = loadError ? (
    <EmptyState
      title="We couldn't load the plants"
      message={loadError}
      action="Try again"
      onAction={() => setAttempt((n) => n + 1)}
    />
  ) : loading ? (
    <p className={styles.loading}>Loading plants…</p>
  ) : items.length === 0 ? (
    <EmptyState
      title="No plants found"
      message="Check the spelling, or clear your filters."
      action="Clear all"
      onAction={clearAll}
    />
  ) : isMobile ? (
    <PlantCardsMobile plants={items} />
  ) : view === "grid" ? (
    <PlantCards plants={items} columns={filtersOpen ? 3 : 4} />
  ) : (
    <PlantRows plants={items} />
  );

  /* ---------------- phone ---------------- */
  if (isMobile) {
    return (
      <div className={`flora ${styles.mobilePage}`}>
        <div className={styles.mobileTop}>
          <Link to="/" className={styles.mobileBrand}>
            <img src="/logo-biosoc.png" alt="" />
            <span>NDDU Flora</span>
          </Link>
          <h1 className={styles.mobileTitle}>Discover plants</h1>
          <div className={styles.mobileSearchRow}>
            <div className={styles.mobileSearch}>
              <i className="bi bi-search"></i>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search plants"
                aria-label="Search plants"
              />
            </div>
            <button
              type="button"
              className={styles.mobileFilterBtn}
              onClick={() => setSheetOpen(true)}
              title="Filters"
              aria-label="Filters"
            >
              <i className="bi bi-sliders2"></i>
              {hasFilter && <span className={styles.filterDot}></span>}
            </button>
          </div>
        </div>

        <div className={styles.mobileCountRow}>
          <span>
            <b>{loading ? "…" : items.length}</b> {countWord}
          </span>
          <button type="button" className={styles.mobileSort} onClick={toggleSort}>
            <i className="bi bi-arrow-down-up"></i>
            {sortLabel}
          </button>
        </div>

        <div className={styles.mobileResults}>{results}</div>

        <TabBar active="discover" />

        {sheetOpen && (
          <FilterSheet
            {...filterProps}
            count={items.length}
            countWord={countWord}
            onClose={() => setSheetOpen(false)}
          />
        )}
      </div>
    );
  }

  /* ---------------- desktop ---------------- */
  return (
    <div className="flora">
      <SiteHeader active="discover" />

      <div className={styles.hero}>
        <div className={styles.heroTitle}>
          <span className={styles.eyebrow}>Campus collection</span>
          <h1>Discover plants</h1>
        </div>
        <SearchBar query={query} onQuery={setQuery} mode={mode} onMode={setMode} />
      </div>

      <div className={`${styles.body} ${filtersOpen ? styles.bodyWithFilters : ""}`}>
        {filtersOpen && <FilterSidebar {...filterProps} />}

        <div className={styles.results}>
          <div className={styles.toolbar}>
            <span className={styles.count}>
              <b>{loading ? "…" : items.length}</b> {countWord}
            </span>
            <div className={styles.tools}>
              <button
                type="button"
                className={`${styles.toolBtn} ${filtersOpen ? styles.filterBtnOpen : ""}`}
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
              >
                <i className="bi bi-sliders"></i>
                {filtersOpen ? "Hide filters" : "Filters"}
                {chips.length > 0 && <span className={styles.filterCount}>{chips.length}</span>}
              </button>
              <button type="button" className={styles.toolBtn} onClick={toggleSort}>
                <i className="bi bi-arrow-down-up"></i>
                {sortLabel}
              </button>
              <div className={styles.viewSwitch} role="group" aria-label="View">
                <button
                  type="button"
                  className={`${styles.viewBtn} ${view === "grid" ? styles.viewOn : ""}`}
                  onClick={() => setView("grid")}
                  title="Grid"
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                >
                  <i className="bi bi-grid"></i>
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${view === "list" ? styles.viewOn : ""}`}
                  onClick={() => setView("list")}
                  title="List"
                  aria-label="List view"
                  aria-pressed={view === "list"}
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>
            </div>
          </div>

          {hasFilter && (
            <div className={styles.chips}>
              {chips.map((chip) => (
                <button key={chip.rank} type="button" className={styles.chip} onClick={chip.remove}>
                  <span className={styles.chipRank}>{chip.rank}:</span>
                  <span className={styles.chipValue}>{chip.value}</span>
                  <i className="bi bi-x"></i>
                </button>
              ))}
            </div>
          )}

          {results}
        </div>
      </div>
    </div>
  );
}
