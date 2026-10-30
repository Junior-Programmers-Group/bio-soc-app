import { useMemo, useState } from "react";
import type { Plant } from "../../../types/plant";
import styles from "./Filters.module.css";

interface FilterProps {
  plants: Plant[];
  taxonomyFilters: Record<string, string>;
  setTaxonomyFilters: (filters: Record<string, string>) => void;
  taxonomyOptions?: Record<string, string[]>;
}

const taxonomyLevels = ["domain", "kingdom", "phylum", "klass", "order", "family", "genus"];

export default function Filters({ plants, taxonomyFilters, setTaxonomyFilters, taxonomyOptions }: FilterProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (level: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // Use provided taxonomy options from database, or extract from plants
  const uniqueTaxonomyValues = useMemo(() => {
    // If taxonomy options are provided from the database, use those
    if (taxonomyOptions && Object.keys(taxonomyOptions).length > 0) {
      return taxonomyOptions;
    }

    // Fallback: Extract unique taxonomy values from plants
    const values: Record<string, Set<string>> = {};

    taxonomyLevels.forEach((level) => {
      values[level] = new Set<string>();
      plants.forEach((plant) => {
        const fieldValue = plant[level as keyof Plant];
        // Only add non-empty string values and filter out ID-like strings
        if (fieldValue && typeof fieldValue === "string") {
          const trimmed = fieldValue.trim();
          // Skip if it looks like a database ID (10+ alphanumeric chars)
          if (trimmed && !/^[a-z0-9]{10,}$/.test(trimmed)) {
            values[level].add(trimmed);
          }
        }
      });
    });

    // Convert Sets to sorted arrays
    const result: Record<string, string[]> = {};
    Object.keys(values).forEach((level) => {
      result[level] = Array.from(values[level]).sort();
    });

    // Log available filters for debugging

    return result;
  }, [plants, taxonomyOptions]);

  const handleClearAllFilters = () => {
    setTaxonomyFilters({});
  };

  const handleClearLevelFilter = (level: string) => {
    const newFilters = { ...taxonomyFilters };
    delete newFilters[level];
    setTaxonomyFilters(newFilters);
  };

  const handleFilterSelect = (level: string, value: string) => {
    const newFilters = { ...taxonomyFilters };
    
    if (newFilters[level] === value) {
      // Deselect if clicking the same value
      delete newFilters[level];
    } else {
      // Select new value (replaces any previous value in this level)
      newFilters[level] = value;
    }

    setTaxonomyFilters(newFilters);
  };

  return (
    <aside className={styles.filters}>
      {Object.keys(taxonomyFilters).length > 0 && (
        <div className={styles.activeFilter}>
          <button className={styles.clearButton} onClick={handleClearAllFilters}>
            ✕ Clear All Filters
          </button>
          <div className={styles.activeFiltersTags}>
            {Object.entries(taxonomyFilters).map(([level, value]) => (
              <div key={level} className={styles.filterTag}>
                <span className={styles.filterTagLabel}>
                  {level === "klass" ? "Class" : level.charAt(0).toUpperCase() + level.slice(1)}:
                </span>
                <span className={styles.filterValue}>
                  {value}
                  <button
                    className={styles.removeTagBtn}
                    onClick={() => handleClearLevelFilter(level)}
                    aria-label={`Remove ${value} filter`}
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {taxonomyLevels.map((level) => (
        <FilterGroup 
          key={level}
          title={level === "klass" ? "Class" : level.charAt(0).toUpperCase() + level.slice(1)}
          level={level}
          options={uniqueTaxonomyValues[level] || []}
          selectedValue={taxonomyFilters[level] || null}
          onSelect={(value) => handleFilterSelect(level, value)}
          isExpanded={expandedGroups[level] || false}
          onToggle={() => toggleGroup(level)}
          onClearLevel={() => handleClearLevelFilter(level)}
        />
      ))}
    </aside>
  );
}

interface FilterGroupProps {
  title: string;
  level: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  onClearLevel: () => void;
}

function FilterGroup({ title, level, options, selectedValue, onSelect, isExpanded, onToggle, onClearLevel }: FilterGroupProps) {
  if (options.length === 0) {
    return (
      <div className={styles.group}>
        <button className={styles.groupHeader} onClick={onToggle}>
          <span className={styles.groupTitle}>{title}</span>
          <span className={styles.expandIcon}>−</span>
        </button>
        <div className={`${styles.optionsList} ${isExpanded ? styles.expanded : styles.collapsed}`}>
          <p className={styles.noOptions}>No options available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.group}>
      <div className={styles.groupHeaderWrapper}>
        <button className={styles.groupHeader} onClick={onToggle}>
          <span className={styles.groupTitle}>
            {title} ({options.length})
            {selectedValue && (
              <span className={styles.selectedCount}> - 1 selected</span>
            )}
          </span>
          <span className={`${styles.expandIcon} ${isExpanded ? styles.rotated : ""}`}>›</span>
        </button>
        {selectedValue && (
          <button
            className={styles.groupClearBtn}
            onClick={onClearLevel}
            title="Clear this category"
          >
            ✕
          </button>
        )}
      </div>
      <div className={`${styles.optionsList} ${isExpanded ? styles.expanded : styles.collapsed}`}>
        {options.map((option) => {
          // Filter out ID-like strings (10+ alphanumeric characters that look like database IDs)
          if (/^[a-z0-9]{10,}$/.test(option)) {
            return null;
          }
          return (
            <label key={option} className={selectedValue === option ? styles.selectedLabel : ""}>
              <input
                type="radio"
                name={`taxonomy-${level}`}
                checked={selectedValue === option}
                onChange={() => onSelect(option)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
