import { useMemo } from "react";
import type { Plant } from "../../../types/plant";
import styles from "./Filters.module.css";

interface FilterProps {
  plants: Plant[];
  taxonomyFilter: { level: string; value: string } | null;
  setTaxonomyFilter: (filter: { level: string; value: string } | null) => void;
}

export default function Filters({ plants, taxonomyFilter, setTaxonomyFilter }: FilterProps) {
  const taxonomyLevels = ["domain", "kingdom", "phylum", "klass", "order", "family", "subfamily", "genus", "species"];

  // Extract unique taxonomy values
  const uniqueTaxonomyValues = useMemo(() => {
    const values: Record<string, Set<string>> = {};

    taxonomyLevels.forEach((level) => {
      values[level] = new Set<string>();
      plants.forEach((plant) => {
        const fieldValue = plant[level as keyof Plant];
        if (fieldValue && typeof fieldValue === "string" && fieldValue.trim()) {
          values[level].add(fieldValue);
        }
      });
    });

    // Convert Sets to sorted arrays
    const result: Record<string, string[]> = {};
    Object.keys(values).forEach((level) => {
      result[level] = Array.from(values[level]).sort();
    });

    return result;
  }, [plants]);

  const handleClearFilter = () => {
    setTaxonomyFilter(null);
  };

  return (
    <aside className={styles.filters}>
      {taxonomyFilter && (
        <button className={styles.clearButton} onClick={handleClearFilter}>
          ✕ Clear Filter
        </button>
      )}

      {taxonomyLevels.map((level) => (
        <FilterGroup 
          key={level}
          title={level === "klass" ? "Class" : level.charAt(0).toUpperCase() + level.slice(1)}
          level={level}
          options={uniqueTaxonomyValues[level] || []}
          selectedValue={taxonomyFilter?.level === level ? taxonomyFilter.value : null}
          onSelect={(value) =>
            setTaxonomyFilter({ level, value })
          }
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
}

function FilterGroup({ title, options, selectedValue, onSelect }: FilterGroupProps) {
  return (
    <div className={styles.group}>
      <h4>{title}</h4>
      <div className={styles.optionsList}>
        {options.length > 0 ? (
          options.map((option) => {
            // If this is the genus level and the option looks like an ID, skip it
            if (title.toLowerCase() === "genus" && /[a-z0-9]{10,}/.test(option)) {
              return null;
            }
            return (
              <label key={option}>
                <input
                  type="radio"
                  checked={selectedValue === option}
                  onChange={() => onSelect(option)}
                />
                {option}
              </label>
            );
          })
        ) : (
          <p className={styles.noOptions}>No options available</p>
        )}
      </div>
    </div>
  );
}
