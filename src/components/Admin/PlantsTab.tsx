import { useState } from "react";
import type { Plant } from "../../types/plant";
import { statusOf, STATUS_OPTIONS } from "../../lib/status";
import { formatMonthDay } from "../../lib/format";
import PlantPhoto from "../Flora/PlantPhoto";
import styles from "./tabs.module.css";

interface Props {
  plants: Plant[];
  isMobile: boolean;
  onQr: (plant: Plant) => void;
  onEdit: (plant: Plant) => void;
  onDelete: (plant: Plant) => void;
}

type Filter = "All" | "LC" | "VU" | "EN";

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "All", label: "All" },
  ...STATUS_OPTIONS.map((s) => ({ key: s.key, label: s.label })),
];

export default function PlantsTab({ plants, isMobile, onQr, onEdit, onDelete }: Props) {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const searched = plants.filter(
    (p) =>
      !q ||
      p.commonName.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q) ||
      (p.code ?? "").toLowerCase().includes(q)
  );
  const countOf = (key: Filter) =>
    key === "All" ? searched.length : searched.filter((p) => statusOf(p.conservationStatus).key === key).length;
  const items = searched.filter((p) => filter === "All" || statusOf(p.conservationStatus).key === filter);

  /* ---------------- phone ---------------- */
  if (isMobile) {
    return (
      <>
        <div className={styles.mSearch}>
          <i className="bi bi-search"></i>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search plants" aria-label="Search plants" />
        </div>
        <div className={styles.mChips}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.mChip} ${filter === f.key ? styles.mChipOn : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {items.map((plant) => {
          const status = statusOf(plant.conservationStatus);
          return (
            <div key={plant.id} className={`${styles.mCard} ${status.className}`}>
              {plant.image ? (
                <div className={styles.mThumb}>
                  <PlantPhoto src={plant.thumbnail || plant.image} alt="" />
                </div>
              ) : (
                <span className={styles.mNoThumb}>
                  <i className="bi bi-image"></i>
                </span>
              )}
              <div className={styles.mName}>
                <b>{plant.commonName}</b>
                <span className={styles.mMeta}>
                  <span className={styles.mono}>{plant.code}</span>
                  <span className={styles.shortStatus}>
                    <span className={styles.pillDot}></span>
                    {status.short}
                  </span>
                </span>
              </div>
              <button type="button" className={styles.mIcon} onClick={() => onQr(plant)} title="QR tag" aria-label="QR tag">
                <i className="bi bi-qr-code"></i>
              </button>
              <button type="button" className={styles.mIcon} onClick={() => onEdit(plant)} title="Edit" aria-label="Edit">
                <i className="bi bi-pencil"></i>
              </button>
            </div>
          );
        })}
        {items.length === 0 && <p className={styles.empty}>No plants found</p>}
      </>
    );
  }

  /* ---------------- desktop ---------------- */
  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.segments} role="group" aria-label="Status">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.segment} ${filter === f.key ? styles.segmentOn : ""}`}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
            >
              {f.label} <span>{countOf(f.key)}</span>
            </button>
          ))}
        </div>
        <div className={styles.search}>
          <i className="bi bi-search"></i>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or code" aria-label="Search by name or code" />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.plantHead}>
          <span>Code</span>
          <span>Plant</span>
          <span>Family</span>
          <span>Status</span>
          <span>Updated</span>
          <span>Actions</span>
        </div>
        {items.map((plant) => {
          const status = statusOf(plant.conservationStatus);
          return (
            <div key={plant.id} className={`${styles.plantRow} ${status.className}`}>
              <span className={styles.code}>{plant.code}</span>
              <div className={styles.plantCell}>
                {plant.image ? (
                  <div className={styles.thumb}>
                    <PlantPhoto src={plant.thumbnail || plant.image} alt="" />
                  </div>
                ) : (
                  <span className={styles.noThumb}>
                    <i className="bi bi-image"></i>
                  </span>
                )}
                <div className={styles.plantName}>
                  <b>{plant.commonName}</b>
                  <i>{plant.scientificName}</i>
                </div>
              </div>
              <span className={styles.family}>{plant.family}</span>
              <span className={styles.pill}>
                <span className={styles.pillDot}></span>
                {status.label}
              </span>
              <span className={styles.updated}>{formatMonthDay(plant.updated)}</span>
              <div className={styles.actions}>
                <button type="button" className={styles.iconBtn} onClick={() => onQr(plant)} title="QR tag" aria-label="QR tag">
                  <i className="bi bi-qr-code"></i>
                </button>
                <button type="button" className={styles.iconBtn} onClick={() => onEdit(plant)} title="Edit" aria-label="Edit">
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  type="button"
                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={() => onDelete(plant)}
                  title="Delete"
                  aria-label="Delete"
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className={styles.empty}>No plants found</p>}
      </div>
    </>
  );
}
